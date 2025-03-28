import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState<Guardian[]>([]);

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

  const handleLogout = () => {
    logout();
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
      
      // Reset the form
      setCurrentGuardian({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        relationship: '',
        address: '',
        nationalId: ''
      });

      // Show success message with login instructions
      alert(`Guardian registered successfully! Login credentials:\nEmail: ${currentGuardian.email}\nPassword: Your National ID (${currentGuardian.nationalId})`);
    } catch (error) {
      console.error('Error registering guardian:', error);
      alert(error instanceof Error ? error.message : 'Failed to register guardian. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Guardian Registration</h2>
        
        {/* List of Registered Guardians */}
        {guardians.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Registered Guardians</h3>
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
      </div>
    </div>
  );
};

export default StudentDashboard; 