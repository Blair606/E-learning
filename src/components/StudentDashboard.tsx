import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Department, schoolService } from '../services/schoolService';

// Update the Guardian interface
interface Guardian {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  relationship: string;
  address: string;
  nationalId: string;
}

// Add StudentProfile interface
interface StudentProfile {
  school_id: number;
  department_id: number;
  school_name?: string;
  department_name?: string;
}

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    school_id: 0,
    department_id: 0,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);

  // Update the currentGuardian state initialization
  const [currentGuardian, setCurrentGuardian] = useState<Guardian>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    relationship: '',
    address: '',
    nationalId: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Add useEffect to fetch schools and student profile
  useEffect(() => {
    const fetchSchoolsAndProfile = async () => {
      try {
        // Fetch schools
        const schoolsData = await schoolService.getAllSchools();
        setSchools(schoolsData);

        // Fetch student profile
        const response = await fetch(`/api/students/${user?.id}/profile`);
        if (response.ok) {
          const profileData = await response.json();
          setStudentProfile(profileData);
          
          // If profile has school_id, fetch departments
          if (profileData.school_id) {
            const departmentsData = await schoolService.getDepartmentsBySchool(profileData.school_id);
            setDepartments(departmentsData);
          }
        }
      } catch (error) {
        console.error('Error fetching schools and profile:', error);
      }
    };

    if (user) {
      fetchSchoolsAndProfile();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  // Add handleSchoolChange function
  const handleSchoolChange = async (schoolId: number) => {
    try {
      const departmentsData = await schoolService.getDepartmentsBySchool(schoolId);
      setDepartments(departmentsData);
      setStudentProfile(prev => ({
        ...prev,
        school_id: schoolId,
        department_id: 0 // Reset department when school changes
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Add handleProfileUpdate function
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/students/${user?.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh the profile data
      const updatedProfile = await response.json();
      setStudentProfile(updatedProfile);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Update fetchGuardians function
  const fetchGuardians = async () => {
    try {
      const response = await fetch(`/api/guardians/student/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch guardians');
      }
      const data = await response.json();
      
      // Transform the data to match our Guardian interface
      const transformedGuardians = data.map((guardian: any) => ({
        firstName: guardian.first_name,
        lastName: guardian.last_name,
        email: guardian.email,
        phoneNumber: guardian.phone_number,
        relationship: guardian.relationship,
        address: guardian.address,
        nationalId: guardian.national_id
      }));
      
      setGuardians(transformedGuardians);
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
    }
  };

  // Add useEffect to fetch guardians on component mount
  useEffect(() => {
    if (user) {
      fetchGuardians();
    }
  }, [user]);

  // Update handleGuardianRegistration function
  const handleGuardianRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create the guardian user account
      const guardianResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentGuardian.email,
          first_name: currentGuardian.firstName,
          last_name: currentGuardian.lastName,
          phone_number: currentGuardian.phoneNumber,
          role: 'parent',
          status: 'active',
          password: currentGuardian.nationalId,
          national_id: currentGuardian.nationalId
        }),
      });

      if (!guardianResponse.ok) {
        const errorData = await guardianResponse.json();
        throw new Error(errorData.message || 'Failed to create guardian account');
      }

      const guardianData = await guardianResponse.json();

      // Then create the guardian-student relationship
      const relationshipResponse = await fetch('/api/guardian-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guardian_id: guardianData.id,
          student_id: user?.id,
          relationship: currentGuardian.relationship,
          address: currentGuardian.address,
          is_primary: guardians.length === 0
        }),
      });

      if (!relationshipResponse.ok) {
        const errorData = await relationshipResponse.json();
        throw new Error(errorData.message || 'Failed to create guardian relationship');
      }

      // Refresh the guardians list
      await fetchGuardians();
      
      // Reset the form and close the dropdown
      setCurrentGuardian({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        relationship: '',
        address: '',
        nationalId: ''
      });
      setIsAddingGuardian(false);

      // Show success message with login instructions
      alert(`Guardian registered successfully! Login credentials:\nEmail: ${currentGuardian.email}\nPassword: Your National ID (${currentGuardian.nationalId})`);
    } catch (error) {
      console.error('Error registering guardian:', error);
      alert(error instanceof Error ? error.message : 'Failed to register guardian. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Student Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Student Profile</h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">School</label>
              <select
                value={studentProfile.school_id}
                onChange={(e) => handleSchoolChange(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={studentProfile.department_id}
                onChange={(e) => setStudentProfile(prev => ({
                  ...prev,
                  department_id: Number(e.target.value)
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!studentProfile.school_id}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">School:</span> {studentProfile.school_name || 'Not set'}</p>
            <p><span className="font-medium">Department:</span> {studentProfile.department_name || 'Not set'}</p>
          </div>
        )}
      </div>

      {/* Guardians Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Guardians</h2>
          <button
            onClick={() => setIsAddingGuardian(!isAddingGuardian)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {isAddingGuardian ? 'Cancel' : 'Add Guardian'}
          </button>
        </div>

        {/* List of Registered Guardians */}
        {guardians.length > 0 && (
          <div className="mb-6">
            <div className="space-y-4">
              {guardians.map((guardian, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                      <p className="text-sm text-gray-600">{guardian.relationship}</p>
                      <p className="text-sm text-gray-600">{guardian.email}</p>
                      <p className="text-sm text-gray-600">{guardian.phoneNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        setGuardians(guardians.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guardian Registration Form */}
        {isAddingGuardian && (
          <form onSubmit={handleGuardianRegistration} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={currentGuardian.firstName}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={currentGuardian.lastName}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <select
                  value={currentGuardian.relationship}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, relationship: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={currentGuardian.email}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={currentGuardian.phoneNumber}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">National ID</label>
                <input
                  type="text"
                  value={currentGuardian.nationalId}
                  onChange={(e) => setCurrentGuardian({ ...currentGuardian, nationalId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={currentGuardian.address}
                onChange={(e) => setCurrentGuardian({ ...currentGuardian, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Register Guardian
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 