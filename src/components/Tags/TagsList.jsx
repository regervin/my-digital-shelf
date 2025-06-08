import React, { useState } from 'react';
import { useTags } from '../../hooks/useTags';
import { formatDate } from '../../utils/formatters';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader, 
  Tag as TagIcon,
  Save,
  X
} from 'lucide-react';

export default function TagsList() {
  const { 
    tags, 
    loading, 
    error, 
    addTag, 
    updateTag, 
    deleteTag 
  } = useTags();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
      } else {
        await addTag(formData);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving tag:', err);
      alert('Failed to save tag. Please try again.');
    }
  };
  
  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name
    });
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      const result = await deleteTag(id);
      if (!result.success) {
        alert('Failed to delete tag. Please try again.');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: ''
    });
    setEditingTag(null);
    setShowForm(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading tags. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Product Tags</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Tag
        </button>
      </div>
      
      {/* Tag Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tag Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="-ml-1 mr-2 h-4 w-4" />
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Tags List */}
      {tags.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tags.map((tag) => (
              <li key={tag.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <div className="text-sm font-medium text-gray-900">
                        {tag.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(tag.created_at)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tags</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new tag.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
