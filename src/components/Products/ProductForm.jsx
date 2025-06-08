import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useFiles } from '../../hooks/useFiles';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { formatFileSize } from '../../utils/formatters';
import { Loader, Save, X, Upload, File, Image, Tag, FolderTree, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, error: productsError, addProduct, updateProduct } = useProducts();
  const { files, loading: filesLoading, error: filesError, uploadFile, deleteFile } = useFiles();
  const { categories, loading: categoriesLoading, getCategoryTree, getProductCategories } = useCategories();
  const { tags, loading: tagsLoading, getProductTags } = useTags();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'draft',
    image_url: ''
  });
  
  const [productFiles, setProductFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Category and tag state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  
  const isEditMode = !!id;
  
  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && products.length > 0) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          status: product.status || 'draft',
          image_url: product.image_url || ''
        });
        
        if (product.image_url) {
          setImagePreview(product.image_url);
        }
      }
    }
  }, [isEditMode, id, products]);
  
  // Load product files
  useEffect(() => {
    if (isEditMode && files.length > 0) {
      const productFiles = files.filter(file => file.product_id === id);
      setProductFiles(productFiles);
    }
  }, [isEditMode, id, files]);
  
  // Load product categories and tags
  useEffect(() => {
    if (isEditMode) {
      const loadCategoriesAndTags = async () => {
        const categoriesResult = await getProductCategories(id);
        if (categoriesResult.success) {
          setSelectedCategories(categoriesResult.data);
        }
        
        const tagsResult = await getProductTags(id);
        if (tagsResult.success) {
          setSelectedTags(tagsResult.data);
        }
      };
      
      loadCategoriesAndTags();
    }
  }, [isEditMode, id, getProductCategories, getProductTags]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    if (!isEditMode) {
      alert('Please save the product first before uploading files.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(file, id);
      }
      
      setSaveMessage({
        type: 'success',
        text: 'Files uploaded successfully!'
      });
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: `Failed to upload files: ${err.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage({ type: '', text: '' });
      }, 3000);
    }
  };
  
  const handleRemoveFile = async (fileId, filePath) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const result = await deleteFile(fileId, filePath);
      if (!result.success) {
        alert('Failed to delete file. Please try again.');
      }
    }
  };
  
  const uploadProductImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    
    try {
      // Generate a unique file path
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `product_images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product_files')
        .upload(filePath, imageFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product_files')
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    if (categoryId === '') return;
    
    const category = categories.find(c => c.id === categoryId);
    if (category && !selectedCategories.some(c => c.id === categoryId)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId));
  };
  
  const handleTagChange = (e) => {
    const tagId = e.target.value;
    if (tagId === '') return;
    
    const tag = tags.find(t => t.id === tagId);
    if (tag && !selectedTags.some(t => t.id === tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleRemoveTag = (tagId) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };
  
  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const { success, data } = await useCategories().addCategory({ name: newCategory });
      if (success && data) {
        setSelectedCategories([...selectedCategories, data]);
        setNewCategory('');
        setShowCategoryForm(false);
      } else {
        alert('Failed to add category. Please try again.');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleAddNewTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const { success, data } = await useTags().addTag({ name: newTag });
      if (success && data) {
        setSelectedTags([...selectedTags, data]);
        setNewTag('');
        setShowTagForm(false);
      } else {
        alert('Failed to add tag. Please try again.');
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      alert(`Error: ${err.message}`);
    }
  };
  
  const updateProductCategoriesAndTags = async (productId) => {
    const { assignProductToCategory, removeProductFromCategory, getProductCategories } = useCategories();
    const { assignTagToProduct, removeTagFromProduct, getProductTags } = useTags();
    
    // Get current categories and tags
    const currentCategoriesResult = await getProductCategories(productId);
    const currentCategories = currentCategoriesResult.success ? currentCategoriesResult.data : [];
    
    const currentTagsResult = await getProductTags(productId);
    const currentTags = currentTagsResult.success ? currentTagsResult.data : [];
    
    // Update categories
    const categoriesToAdd = selectedCategories.filter(
      newCat => !currentCategories.some(currentCat => currentCat.id === newCat.id)
    );
    
    const categoriesToRemove = currentCategories.filter(
      currentCat => !selectedCategories.some(newCat => newCat.id === currentCat.id)
    );
    
    for (const category of categoriesToAdd) {
      await assignProductToCategory(productId, category.id);
    }
    
    for (const category of categoriesToRemove) {
      await removeProductFromCategory(productId, category.id);
    }
    
    // Update tags
    const tagsToAdd = selectedTags.filter(
      newTag => !currentTags.some(currentTag => currentTag.id === newTag.id)
    );
    
    const tagsToRemove = currentTags.filter(
      currentTag => !selectedTags.some(newTag => newTag.id === currentTag.id)
    );
    
    for (const tag of tagsToAdd) {
      await assignTagToProduct(productId, tag.id);
    }
    
    for (const tag of tagsToRemove) {
      await removeTagFromProduct(productId, tag.id);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }
      
      // Upload image if selected
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadProductImage();
      }
      
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        image_url: imageUrl
      };
      
      let result;
      
      if (isEditMode) {
        result = await updateProduct(id, productData);
        
        if (result.success) {
          // Update categories and tags
          await updateProductCategoriesAndTags(id);
        }
      } else {
        result = await addProduct(productData);
        
        // If product was created successfully, update categories and tags
        if (result.success) {
          await updateProductCategoriesAndTags(result.data.id);
          navigate(`/products/${result.data.id}/edit`);
          return;
        }
      }
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: `Product ${isEditMode ? 'updated' : 'created'} successfully!`
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: `Failed to ${isEditMode ? 'update' : 'create'} product: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if ((productsLoading && isEditMode) || (filesLoading && isEditMode) || categoriesLoading || tagsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if ((productsError && isEditMode) || (filesError && isEditMode)) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading product data. Please try again.</p>
      </div>
    );
  }
  
  // Prepare category tree for dropdown
  const categoryTree = getCategoryTree();
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-medium mb-6">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Premium E-book"
              />
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your product..."
              ></textarea>
            </div>
            
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedCategories.map(category => (
                  <div 
                    key={category.id}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center text-sm"
                  >
                    <FolderTree className="h-3 w-3 mr-1" />
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <select
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value=""
                  onChange={handleCategoryChange}
                >
                  <option value="">Select a category</option>
                  {categoryTree.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showCategoryForm && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <div 
                    key={tag.id}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center text-sm"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <select
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value=""
                  onChange={handleTagChange}
                >
                  <option value="">Select a tag</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowTagForm(!showTagForm)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showTagForm && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="New tag name"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTag}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="max-h-48 max-w-full rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                          Upload a product image
                        </span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Files (only in edit mode) */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Files
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-300">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Upload Files
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </div>
                    </label>
                  </div>
                  
                  <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                    {productFiles.length > 0 ? (
                      productFiles.map((file) => (
                        <li key={file.id} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id, file.path)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="p-4 text-center text-sm text-gray-500">
                        No files uploaded yet
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Save Message */}
        {saveMessage.text && (
          <div className={`mt-6 p-3 rounded ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || uploadingImage}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving || uploadingImage ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
