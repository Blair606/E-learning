import React, { useState, useEffect } from 'react'
import CreateDepartmentModal from '../../../components/modals/CreateDepartmentModal';
import { BuildingLibraryIcon } from '@heroicons/react/16/solid';
import { departmentService, Department } from '../../../services/departmentService';
import { useNavigate } from 'react-router-dom';

function Departments() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
    const [departmentSchoolFilter, setDepartmentSchoolFilter] = useState("");
    const [departmentStatusFilter, setDepartmentStatusFilter] = useState("");
    const [currentDepartmentPage, setCurrentDepartmentPage] = useState(1);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const departmentsPerPage = 10;

    // Add department modal state
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [editDepartmentData, setEditDepartmentData] = useState<Department | undefined>();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/signin');
            return;
        }
        fetchDepartments();
    }, [navigate]);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            console.log('Fetching departments with token:', token);
            const data = await departmentService.getAllDepartments();
            console.log('Fetched departments:', data);
            setDepartments(data);
            setError('');
        } catch (err) {
            console.error('Error loading departments:', err);
            if (err instanceof Error && err.message.includes('401')) {
                localStorage.removeItem('token');
                navigate('/signin');
            } else {
                setError('Failed to load departments. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDepartment = async (departmentData: Department) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await departmentService.createDepartment(departmentData);
            await fetchDepartments(); // Refresh the list
            setIsDepartmentModalOpen(false);
            setError('');
        } catch (err) {
            console.error('Error creating department:', err);
            if (err instanceof Error && err.message.includes('401')) {
                localStorage.removeItem('token');
                navigate('/signin');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to create department. Please try again.');
            }
        }
    };

    const handleEditDepartment = async (departmentData: Department) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            if (!departmentData.id) {
                throw new Error('Department ID is required for editing');
            }
            await departmentService.updateDepartment({
                ...departmentData,
                id: departmentData.id
            });
            await fetchDepartments(); // Refresh the list
            setIsDepartmentModalOpen(false);
            setError('');
        } catch (err) {
            console.error('Error updating department:', err);
            if (err instanceof Error && err.message.includes('401')) {
                localStorage.removeItem('token');
                navigate('/signin');
            } else {
                setError('Failed to update department. Please try again.');
            }
        }
    };

    const handleDeleteDepartment = async (departmentId: number) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                await departmentService.deleteDepartment(departmentId);
                await fetchDepartments(); // Refresh the list
                setError('');
            } catch (err) {
                console.error('Error deleting department:', err);
                if (err instanceof Error && err.message.includes('401')) {
                    localStorage.removeItem('token');
                    navigate('/signin');
                } else {
                    setError('Failed to delete department. Please try again.');
                }
            }
        }
    };

    // Filter departments
    const filteredDepartments = departments.filter((department) => {
        const matchesSearch =
            department.name.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
            department.code.toLowerCase().includes(departmentSearchTerm.toLowerCase());
        const matchesSchool =
            !departmentSchoolFilter || department.school_id.toString() === departmentSchoolFilter;
        const matchesStatus =
            !departmentStatusFilter || department.status === departmentStatusFilter;
        return matchesSearch && matchesSchool && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-4 sm:space-y-6">
                {/* Header with Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Department Management
                    </h2>
                    <button
                        onClick={() => {
                            setEditDepartmentData(undefined);
                            setIsDepartmentModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
                    >
                        <BuildingLibraryIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="text-sm sm:text-base">Add Department</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={departmentSearchTerm}
                                    onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                                    placeholder="Search departments..."
                                    className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:border-purple-500"
                                />
                                <svg
                                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            <select
                                value={departmentSchoolFilter}
                                onChange={(e) => setDepartmentSchoolFilter(e.target.value)}
                                className="flex-1 sm:flex-none min-w-[120px] text-sm sm:text-base border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:border-purple-500"
                            >
                                <option key="all" value="">All Schools</option>
                                {Array.from(new Set(departments.map(d => d.school_id))).map(schoolId => {
                                    const school = departments.find(d => d.school_id === schoolId);
                                    return (
                                        <option key={`school-${schoolId}`} value={schoolId}>
                                            {school?.school_name || `School ${schoolId}`}
                                        </option>
                                    );
                                })}
                            </select>
                            <select
                                value={departmentStatusFilter}
                                onChange={(e) => setDepartmentStatusFilter(e.target.value)}
                                className="flex-1 sm:flex-none min-w-[120px] text-sm sm:text-base border rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:border-purple-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Departments Table */}
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Department
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            School
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDepartments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 sm:px-6 py-4 text-center text-gray-500">
                                                No departments found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDepartments
                                            .slice(
                                                (currentDepartmentPage - 1) * departmentsPerPage,
                                                currentDepartmentPage * departmentsPerPage
                                            )
                                            .map((department) => (
                                                <tr key={department.id} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                            {department.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {department.code}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <div className="text-xs sm:text-sm text-gray-500">
                                                            {department.school_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full ${
                                                                department.status === "active"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {department.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                        <div className="flex space-x-2 sm:space-x-3">
                                                            <button
                                                                onClick={() => {
                                                                    setEditDepartmentData(department);
                                                                    setIsDepartmentModalOpen(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDepartment(department.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {filteredDepartments.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                            Showing{" "}
                            {Math.min(
                                (currentDepartmentPage - 1) * departmentsPerPage + 1,
                                filteredDepartments.length
                            )}{" "}
                            to{" "}
                            {Math.min(
                                currentDepartmentPage * departmentsPerPage,
                                filteredDepartments.length
                            )}{" "}
                            of {filteredDepartments.length} departments
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentDepartmentPage((prev) => Math.max(prev - 1, 1))
                                }
                                disabled={currentDepartmentPage === 1}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from(
                                {
                                    length: Math.ceil(
                                        filteredDepartments.length / departmentsPerPage
                                    ),
                                },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentDepartmentPage(page)}
                                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
                                        currentDepartmentPage === page
                                            ? "bg-purple-500 text-white"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentDepartmentPage((prev) =>
                                        Math.min(
                                            prev + 1,
                                            Math.ceil(
                                                filteredDepartments.length / departmentsPerPage
                                            )
                                        )
                                    )
                                }
                                disabled={
                                    currentDepartmentPage ===
                                    Math.ceil(filteredDepartments.length / departmentsPerPage)
                                }
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Department Create/Edit Modal */}
                <CreateDepartmentModal
                    isOpen={isDepartmentModalOpen}
                    onClose={() => {
                        setIsDepartmentModalOpen(false);
                        setEditDepartmentData(undefined);
                    }}
                    onSubmit={(departmentData) => {
                        if (editDepartmentData) {
                            handleEditDepartment(departmentData);
                        } else {
                            handleCreateDepartment(departmentData);
                        }
                    }}
                    editData={editDepartmentData}
                />
            </div>
        </div>
    )
}

export default Departments
