import React from 'react';
import uploadarea from '../../assets/upload.png';

const AddService = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add services</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 font-medium mb-3">Upload image</p>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((item) => (
            <label 
              htmlFor="image" 
              key={item}
              className="cursor-pointer"
            >
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors">
                <img 
                  src={uploadarea} 
                  alt="Upload area" 
                  className="w-12 h-12 opacity-60"
                />
              </div>
            </label>
          ))}
        </div>
        <input type="file" id="image" className="hidden" multiple />
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 font-medium mb-3">Description</p>
        <textarea 
          name="description" 
          placeholder="Explain about your services" 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="5"
        ></textarea>
      </div>
      
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        Add Service
      </button>
    </div>
  );
}

export default AddService;