import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, BankOutlined, BookOutlined, GraduationCapOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface EditTeacherProfileModalProps {
  visible: boolean;
  onClose: () => void;
  teacher: any;
  onUpdate: () => void;
}

const EditTeacherProfileModal: React.FC<EditTeacherProfileModalProps> = ({
  visible,
  onClose,
  teacher,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(teacher);
      
      // Fetch schools and departments when modal opens
      fetchSchools();
      fetchDepartments();
    }
  }, [visible, teacher, form]);

  const getAuthToken = () => {
    if (!user?.token) {
      throw new Error('No authentication token available. Please log in again.');
    }
    return user.token;
  };

  const fetchSchools = async () => {
    try {
      setFetchingData(true);
      console.log('Fetching schools...');
      
      const response = await axios.get('/api/schools/index.php');
      
      console.log('Schools API response:', response.data);
      console.log('Schools API response type:', typeof response.data);
      console.log('Schools API response keys:', Object.keys(response.data));
      
      if (response.data && response.data.schools) {
        console.log('Schools array:', response.data.schools);
        console.log('Schools array type:', typeof response.data.schools);
        console.log('Is schools an array?', Array.isArray(response.data.schools));
        
        if (Array.isArray(response.data.schools)) {
          setSchools(response.data.schools);
        } else {
          console.error('Schools is not an array:', response.data.schools);
          message.error('Failed to fetch schools: Invalid data format');
          setSchools([]);
        }
      } else {
        console.error('Invalid schools response format:', response.data);
        message.error('Failed to fetch schools: Invalid response format');
        setSchools([]);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to fetch schools: ${error.response.data.message || 'Unknown error'}`);
      } else {
        message.error('Failed to fetch schools. Please try again later.');
      }
      setSchools([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setFetchingData(true);
      console.log('Fetching departments...');
      
      const response = await axios.get('/api/departments/index.php');
      
      console.log('Departments API response:', response.data);
      console.log('Departments API response type:', typeof response.data);
      console.log('Departments API response keys:', Object.keys(response.data));
      
      if (response.data && response.data.departments) {
        console.log('Departments array:', response.data.departments);
        console.log('Departments array type:', typeof response.data.departments);
        console.log('Is departments an array?', Array.isArray(response.data.departments));
        
        if (Array.isArray(response.data.departments)) {
          setDepartments(response.data.departments);
        } else {
          console.error('Departments is not an array:', response.data.departments);
          message.error('Failed to fetch departments: Invalid data format');
          setDepartments([]);
        }
      } else {
        console.error('Invalid departments response format:', response.data);
        message.error('Failed to fetch departments: Invalid response format');
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Failed to fetch departments: ${error.response.data.message || 'Unknown error'}`);
      } else {
        message.error('Failed to fetch departments. Please try again later.');
      }
      setDepartments([]);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Get token from user object in AuthContext
      const token = user?.token || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }
      
      // Log the request data for debugging
      const requestData = {
        id: teacher.id,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        phone: values.phone,
        address: values.address || '',
        school_id: values.school_id,
        department_id: values.department_id,
        specialization: values.specialization || '',
        education: values.education || '',
        experience: values.experience || '',
        old_department_id: teacher.department_id
      };
      
      console.log('Request data:', requestData);

      // Use the correct API endpoint and data structure
      const response = await axios({
        method: 'put',
        url: '/api/users/update.php',
        data: requestData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        message.success('Profile updated successfully');
        onUpdate();
        onClose();
      } else {
        message.error(response.data?.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        if (error.message.includes('No authentication token')) {
          message.error('Your session has expired. Please log in again.');
          // You might want to redirect to login page here
        } else {
          message.error(`Failed to update profile: ${error.message}`);
        }
      } else if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error';
        message.error(`Failed to update profile: ${errorMessage}`);
        console.error('Error response:', error.response.data);
      } else {
        message.error('Failed to update profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      {fetchingData ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p>Loading schools and departments...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={teacher}
        >
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="school_id"
            label="School"
            rules={[{ required: true, message: 'Please select your school' }]}
          >
            <Select
              placeholder="Select a school"
            >
              {Array.isArray(schools) && schools.length > 0 ? (
                schools.map((school: any) => (
                  <Select.Option key={school.id} value={school.id}>
                    {school.name}
                  </Select.Option>
                ))
              ) : (
                <Select.Option disabled>No schools available</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: 'Please select your department' }]}
          >
            <Select
              placeholder="Select a department"
            >
              {Array.isArray(departments) && departments.length > 0 ? (
                departments.map((department: any) => (
                  <Select.Option key={department.id} value={department.id}>
                    {department.name}
                  </Select.Option>
                ))
              ) : (
                <Select.Option disabled>No departments available</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Specialization"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="education"
            label="Education"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="experience"
            label="Experience"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditTeacherProfileModal; 