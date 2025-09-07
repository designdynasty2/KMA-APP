import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize demo data
async function initializeDemoData() {
  // Create demo users with roles
  const demoUsers = [
    { email: 'admin@montessori.edu', password: 'admin123', role: 'admin', name: 'School Administrator' },
    { email: 'teacher@montessori.edu', password: 'teacher123', role: 'lead_teacher', name: 'Ms. Johnson' },
    { email: 'parent@montessori.edu', password: 'parent123', role: 'parent', name: 'John Parent' }
  ];

  for (const user of demoUsers) {
    try {
      // Check if user exists
      const existingUser = await kv.get(`user_role:${user.email}`);
      if (!existingUser) {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { name: user.name },
          email_confirm: true
        });

        if (!error && data.user) {
          // Store user role in KV store
          await kv.set(`user_role:${user.email}`, user.role);
          await kv.set(`user_profile:${data.user.id}`, {
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          });
          console.log(`Demo user created: ${user.email} with role: ${user.role}`);
        } else {
          console.log(`User already exists or error: ${user.email}`);
        }
      }
    } catch (error) {
      console.log(`Error creating demo user ${user.email}:`, error);
    }
  }

  // Initialize demo study materials
  const studyMaterials = [
    { id: '1', name: 'Topic-1: Language Arts', weeks: 4, category: 'language', month: 'august' },
    { id: '2', name: 'Topic-2: Mathematics', weeks: 6, category: 'math', month: 'september' },
    { id: '3', name: 'Topic-3: Cultural Studies', weeks: 3, category: 'culture', month: 'october' },
    { id: '4', name: 'Topic-4: Practical Life', weeks: 2, category: 'practical', month: 'november' }
  ];

  for (const material of studyMaterials) {
    await kv.set(`study_material:${material.id}`, material);
  }

  // Initialize demo teachers
  const teachers = [
    {
      id: '1',
      name: 'Ms. Sarah Johnson',
      employee_number: 'EMP001',
      email: 'teacher@montessori.edu',
      address: '123 School St, City, State',
      work_authorization: 'Authorized',
      designation: 'Lead Teacher',
      salary_type: 'Bi-Weekly',
      wage_per_hour: 25.50
    }
  ];

  for (const teacher of teachers) {
    await kv.set(`teacher:${teacher.id}`, teacher);
  }
}

// Initialize on startup
initializeDemoData();

// Authentication middleware
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'No access token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Invalid access token' }, 401);
  }

  c.set('user', user);
  await next();
}

// Get user role
app.get('/make-server-e5c30ae9/user/role', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const role = await kv.get(`user_role:${user.email}`);
    return c.json({ role: role || 'parent' });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return c.json({ error: 'Failed to fetch user role' }, 500);
  }
});

// Study Materials endpoints
app.get('/make-server-e5c30ae9/study-materials', requireAuth, async (c) => {
  try {
    const materials = await kv.getByPrefix('study_material:');
    return c.json({ materials });
  } catch (error) {
    console.error('Error fetching study materials:', error);
    return c.json({ error: 'Failed to fetch study materials' }, 500);
  }
});

app.post('/make-server-e5c30ae9/study-materials', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const materialId = crypto.randomUUID();
    const material = {
      id: materialId,
      ...body,
      created_at: new Date().toISOString(),
      created_by: user.id
    };

    await kv.set(`study_material:${materialId}`, material);
    return c.json({ material });
  } catch (error) {
    console.error('Error creating study material:', error);
    return c.json({ error: 'Failed to create study material' }, 500);
  }
});

// Teacher Management endpoints
app.get('/make-server-e5c30ae9/teachers', requireAuth, async (c) => {
  try {
    const teachers = await kv.getByPrefix('teacher:');
    return c.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return c.json({ error: 'Failed to fetch teachers' }, 500);
  }
});

app.post('/make-server-e5c30ae9/teachers', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const teacherId = crypto.randomUUID();
    const teacher = {
      id: teacherId,
      ...body,
      created_at: new Date().toISOString(),
      created_by: user.id
    };

    await kv.set(`teacher:${teacherId}`, teacher);
    return c.json({ teacher });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return c.json({ error: 'Failed to create teacher' }, 500);
  }
});

app.put('/make-server-e5c30ae9/teachers/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const teacherId = c.req.param('id');
    const body = await c.req.json();
    const existingTeacher = await kv.get(`teacher:${teacherId}`);
    
    if (!existingTeacher) {
      return c.json({ error: 'Teacher not found' }, 404);
    }

    const updatedTeacher = {
      ...existingTeacher,
      ...body,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`teacher:${teacherId}`, updatedTeacher);
    return c.json({ teacher: updatedTeacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return c.json({ error: 'Failed to update teacher' }, 500);
  }
});

app.delete('/make-server-e5c30ae9/teachers/:id', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const teacherId = c.req.param('id');
    await kv.del(`teacher:${teacherId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return c.json({ error: 'Failed to delete teacher' }, 500);
  }
});

// Time tracking endpoints
app.post('/make-server-e5c30ae9/time-tracking/clock-in', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['lead_teacher', 'sub_teacher'].includes(userRole)) {
      return c.json({ error: 'Only teachers can track time' }, 403);
    }

    const timeEntryId = crypto.randomUUID();
    const timeEntry = {
      id: timeEntryId,
      user_id: user.id,
      email: user.email,
      clock_in: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    await kv.set(`time_entry:${timeEntryId}`, timeEntry);
    await kv.set(`active_time:${user.id}`, timeEntryId);
    return c.json({ timeEntry });
  } catch (error) {
    console.error('Error clocking in:', error);
    return c.json({ error: 'Failed to clock in' }, 500);
  }
});

app.post('/make-server-e5c30ae9/time-tracking/clock-out', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const activeTimeId = await kv.get(`active_time:${user.id}`);
    
    if (!activeTimeId) {
      return c.json({ error: 'No active time entry found' }, 404);
    }

    const timeEntry = await kv.get(`time_entry:${activeTimeId}`);
    if (!timeEntry) {
      return c.json({ error: 'Time entry not found' }, 404);
    }

    const clockOut = new Date();
    const clockIn = new Date(timeEntry.clock_in);
    const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

    const updatedTimeEntry = {
      ...timeEntry,
      clock_out: clockOut.toISOString(),
      hours_worked: Number(hoursWorked.toFixed(2))
    };

    await kv.set(`time_entry:${activeTimeId}`, updatedTimeEntry);
    await kv.del(`active_time:${user.id}`);
    
    return c.json({ timeEntry: updatedTimeEntry });
  } catch (error) {
    console.error('Error clocking out:', error);
    return c.json({ error: 'Failed to clock out' }, 500);
  }
});

// Gallery endpoints
app.post('/make-server-e5c30ae9/gallery/upload', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['lead_teacher', 'sub_teacher', 'admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const body = await c.req.json();
    const photoId = crypto.randomUUID();
    const photo = {
      id: photoId,
      ...body,
      uploaded_by: user.id,
      uploaded_at: new Date().toISOString()
    };

    await kv.set(`gallery_photo:${photoId}`, photo);
    return c.json({ photo });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

app.get('/make-server-e5c30ae9/gallery', requireAuth, async (c) => {
  try {
    const photos = await kv.getByPrefix('gallery_photo:');
    return c.json({ photos });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return c.json({ error: 'Failed to fetch gallery photos' }, 500);
  }
});

// Announcements endpoints
app.post('/make-server-e5c30ae9/announcements', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userRole = await kv.get(`user_role:${user.email}`);
    
    if (!['admin', 'principal', 'lead'].includes(userRole)) {
      return c.json({ error: 'Only leads can create announcements' }, 403);
    }

    const body = await c.req.json();
    const announcementId = crypto.randomUUID();
    const announcement = {
      id: announcementId,
      ...body,
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    await kv.set(`announcement:${announcementId}`, announcement);
    return c.json({ announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return c.json({ error: 'Failed to create announcement' }, 500);
  }
});

app.get('/make-server-e5c30ae9/announcements', requireAuth, async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:');
    return c.json({ announcements: announcements.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )});
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Parent specific endpoints
app.get('/make-server-e5c30ae9/parent/child-info', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    // For demo purposes, return mock child info
    const childInfo = {
      childName: 'Emma Smith',
      className: 'Primary A',
      age: '4-6',
      teacher: 'Ms. Johnson'
    };
    return c.json(childInfo);
  } catch (error) {
    console.error('Error fetching child info:', error);
    return c.json({ error: 'Failed to fetch child info' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-e5c30ae9/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);