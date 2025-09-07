import { User } from '../App';

export function isDemoMode(user: User): boolean {
  return user.access_token.startsWith('demo-token-');
}

export function getDemoData(dataType: string, user: User): any {
  if (!isDemoMode(user)) return null;

  switch (dataType) {
    case 'study-materials':
      return {
        materials: [
          { id: '1', name: 'Topic-1: Language Arts', weeks: 4, category: 'language', month: 'august', description: 'Introduction to phonics and basic reading skills' },
          { id: '2', name: 'Topic-2: Mathematics', weeks: 6, category: 'math', month: 'september', description: 'Number recognition and basic counting' },
          { id: '3', name: 'Topic-3: Cultural Studies', weeks: 3, category: 'culture', month: 'october', description: 'Geography and world cultures introduction' },
          { id: '4', name: 'Topic-4: Practical Life', weeks: 2, category: 'practical', month: 'november', description: 'Daily living skills and independence' }
        ]
      };

    case 'teachers':
      return {
        teachers: [
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
          },
          {
            id: '2',
            name: 'Mr. David Chen',
            employee_number: 'EMP002',
            email: 'david.chen@montessori.edu',
            address: '456 Education Ave, City, State',
            work_authorization: 'Authorized',
            designation: 'Assistant Teacher',
            salary_type: 'Bi-Weekly',
            wage_per_hour: 22.00
          }
        ]
      };

    case 'announcements':
      return {
        announcements: [
          {
            id: '1',
            title: 'Welcome Back to School!',
            content: 'We are excited to welcome all students and families back for the new academic year. Please review the updated school policies in your parent handbook.',
            priority: 'normal',
            target_audience: 'all',
            created_at: new Date().toISOString(),
            created_by: user.id
          },
          {
            id: '2',
            title: 'Parent-Teacher Conference Schedule',
            content: 'Parent-teacher conferences will be held next week. Please check your email for scheduled appointment times.',
            priority: 'high',
            target_audience: 'parents',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            created_by: user.id
          }
        ]
      };

    case 'gallery':
      return {
        photos: [
          {
            id: '1',
            title: 'Art Class Masterpieces',
            description: 'Students created beautiful paintings during our art session',
            imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
            classroom: 'Primary A',
            uploaded_at: new Date().toISOString(),
            uploaded_by: user.id
          },
          {
            id: '2',
            title: 'Science Experiment Fun',
            description: 'Learning about plants and growth in our garden',
            imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400',
            classroom: 'Primary B',
            uploaded_at: new Date(Date.now() - 172800000).toISOString(),
            uploaded_by: user.id
          }
        ]
      };

    case 'child-info':
      return {
        childName: 'Emma Smith',
        className: 'Primary A',
        age: '4-6',
        teacher: 'Ms. Johnson',
        recentActivities: [
          'Completed phonics lesson',
          'Participated in art class',
          'Practiced counting with manipulatives'
        ]
      };

    default:
      return null;
  }
}

export async function demoApiCall(url: string, options: any = {}, user: User): Promise<any> {
  if (!isDemoMode(user)) {
    // Make real API call
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Extract data type from URL for demo mode
  const urlPath = new URL(url).pathname;
  
  if (urlPath.includes('study-materials')) {
    return getDemoData('study-materials', user);
  } else if (urlPath.includes('teachers')) {
    return getDemoData('teachers', user);
  } else if (urlPath.includes('announcements')) {
    return getDemoData('announcements', user);
  } else if (urlPath.includes('gallery')) {
    return getDemoData('gallery', user);
  } else if (urlPath.includes('child-info')) {
    return getDemoData('child-info', user);
  } else if (urlPath.includes('user/role')) {
    return { role: user.role };
  }

  // Default success response for other endpoints
  return { success: true, message: 'Demo mode - operation simulated' };
}