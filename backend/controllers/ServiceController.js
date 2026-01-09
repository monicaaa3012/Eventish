import Service from "../models/ServiceModel.js"

// Add service
// Updated Add service with detailed error catching
const addService = async (req, res) => {
  try {
    // 1. Log the incoming data to your terminal to verify what mobile is sending
    console.log("Incoming Body:", req.body);
    console.log("Incoming Files:", req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const imagePaths = req.files.map((file) => file.path);
    
    // 2. Extract title (Mobile is sending this, so we must catch it)
    const { title, description, price, serviceType } = req.body;

    // 3. Validation check including title
    if (!title || !description || !price || !serviceType) {
      return res.status(400).json({ 
        error: `Missing fields: ${!title ? 'title ' : ''}${!description ? 'description ' : ''}${!price ? 'price ' : ''}${!serviceType ? 'serviceType' : ''}` 
      });
    }

    const numericPrice = Number.parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" });
    }

    const newService = new Service({
      title, // Must be in your ServiceModel.js
      images: imagePaths,
      description,
      price: numericPrice,
      serviceType,
      createdBy: req.user.id,
    });

    await newService.save();

    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });

  } catch (err) {
    // 4. CRITICAL: This logs the EXACT database error in your VS Code terminal
    console.error("DETAILED DATABASE ERROR:", err);

    // 5. Send the specific error message back to the mobile app
    res.status(500).json({ 
      error: err.message || "Internal Server Error" 
    });
  }
};

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching services:", err)
    res.status(500).json({ error: "Failed to fetch services" })
  }
}

// Get services created by logged-in user
const getUserServices = async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching user services:", err)
    res.status(500).json({ error: "Failed to fetch user services" })
  }
}

// Get single service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    // Check if user owns this service
    if (service.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You don't have permission to access this service" })
    }

    res.json(service)
  } catch (err) {
    console.error("Error fetching service:", err)
    res.status(500).json({ error: "Failed to fetch service" })
  }
}

// Update service
const updateService = async (req, res) => {
  try {
    const { description, price, serviceType } = req.body
    const serviceId = req.params.id

    if (!description || !price || !serviceType) {
      return res.status(400).json({ error: "Description, price, and service type are required" })
    }

    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" })
    }

    const service = await Service.findById(serviceId)
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    // Check if user owns this service
    if (service.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You don't have permission to update this service" })
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        description,
        price: numericPrice,
        serviceType,
      },
      { new: true }
    )

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    })
  } catch (err) {
    console.error("Error updating service:", err)
    res.status(500).json({ error: "Failed to update service" })
  }
}

// Delete service
const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id
    const service = await Service.findById(serviceId)
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    // Check if user owns this service
    if (service.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You don't have permission to delete this service" })
    }

    await Service.findByIdAndDelete(serviceId)

    res.json({ message: "Service deleted successfully" })
  } catch (err) {
    console.error("Error deleting service:", err)
    res.status(500).json({ error: "Failed to delete service" })
  }
}

export { addService, getAllServices, getUserServices, getServiceById, updateService, deleteService }
