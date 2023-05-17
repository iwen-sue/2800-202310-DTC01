require("./utils.js");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const multer = require('multer');  // npm install multer
const storage = multer.memoryStorage(); // store the file in memory as a buffer
const upload = multer({ storage: storage }); // specify the storage option
const { GridFSBucket } = require('mongodb');


const mongodb_database = process.env.MONGODB_DATABASE;

const { database } = require('./databaseConnection.js'); 
// var { database } = include('databaseConnection');
// Access the database from the MongoClient

// Access the database object from the imported module
const db = database.db(mongodb_database); // Replace 'your_database_name' with the actual database name

// Create a new GridFSBucket instance using the gridFSBucket() method
const bucket = new GridFSBucket(db);
    
router.post('/uploadImage', upload.single('imageData'), async (req, res) => {
    const imageData = req.file;
    var groupID = req.body.groupID

    console.log(imageData)




    
  // Create a write stream to store the file in MongoDB
  const uploadStream = bucket.openUploadStream(imageData.originalname);


    // Write the file data to the stream
    uploadStream.write(imageData.buffer);
    uploadStream.end();

    // Handle the completion of the upload
    uploadStream.on('finish', async () => {
        const fileId = uploadStream.id.toString();

    res.status(200).json({ message: 'Image uploaded successfully', imageId: fileId });


        
    });

    // Handle any errors during the upload
    uploadStream.on('error', (error) => {
        res.status(500).json({ error: 'An error occurred while uploading the image' });
    });


})

module.exports = router;