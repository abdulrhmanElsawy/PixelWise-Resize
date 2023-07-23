import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

import './css/landing.css';

function Landing() {

    
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [calculateAspect, setCalculateAspect] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [imageData, setImageData] = useState([]); // Array to store width and height for each image
    const [widthAll, setWidthAll] = useState('');
    const [heightAll, setHeightAll] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false); // New state to track image loading
    const [dimensions, setDimensions] = useState([]);
    const [finshed, setFinshed] = useState(false);
    const [renderCount, setRenderCount] = useState(0);

    const [aspectRatios, setAspectRatios] = useState([]); // Store aspect ratios for each image separately



    const setInitialImageDimensions = (img) => {
        const originalAspectRatio = img.width / img.height;
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatios((prevAspectRatios) => [...prevAspectRatios, originalAspectRatio]);
        setImageData((prevImageData) => [...prevImageData, { width: img.width, height: img.height }]);
    };

    const getImageData = (file) => {
        return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
            resolve({ width: img.width, height: img.height });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        });
    };
    

    const downloadZip = async (blob, filename) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    


    const resizeImage = (img, width, height) => {
        return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 1.0);
        });
    };

    const handleResize = async () => {
        if (uploadedFiles.length === 0) {
        alert('Please upload an image.');
        return;
        }
    
        const zip = new JSZip();
        const promises = [];
    
        // Handle each file in the uploadedFiles array
        for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const widthValue = dimensions[i]?.width;
        const heightValue = dimensions[i]?.height;
    
        if (!isNaN(widthValue) && !isNaN(heightValue) && widthValue > 0 && heightValue > 0) {
            const promise = new Promise((resolve) => {
            const reader = new FileReader();
    
            reader.onload = async (event) => {
                const img = new Image();
                img.onload = async () => {
                const blob = await resizeImage(img, widthValue, heightValue);
                // Add the image to the zip file
                zip.file(file.name, blob);
                resolve();
                };
    
                img.src = event.target.result;
            };
    
            reader.readAsDataURL(file);
            });
    
            promises.push(promise);
        } else {
            alert('Please enter valid width and height values for all images.');
            return;
        }
        }
    
        await Promise.all(promises);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
    
        // Call the download function with the zip blob and a custom filename
        downloadZip(zipBlob, 'compressed_images.zip');
    };
    
    const handleWidthAllChange = (event, index) => {
        const widthValue = parseInt(event.target.value, 10);
        if (!isNaN(widthValue) && widthValue > 0) {
            setWidthAll(widthValue);
            setDimensions((prevDimensions) => {
                // You can console.log prevDimensions here to see its value
                index = prevDimensions.length;
    
                // The rest of the code remains the same
                return prevDimensions.map((data, i) => ({
                    ...data,
                    width:  widthValue,
                    height: calculateAspect ? Math.round(widthValue / aspectRatios[i]) : data.height,
                }));
            });
        }
    };
    
    
    const handleHeightAllChange = (event,index) => {
        const heightValue = parseInt(event.target.value, 10);
        if (!isNaN(heightValue) && heightValue > 0) {
            setHeightAll(heightValue);
            setDimensions((prevDimensions) => {
                // You can console.log prevDimensions here to see its value
                index = prevDimensions.length;
    
                // The rest of the code remains the same
                return  prevDimensions.map((data, i) => ({
                    ...data,
                    width: calculateAspect ? Math.round(heightValue * aspectRatios[i]) : data.width,
                    height:heightValue,
                }))
            });
        }
    };
    
    
    const handleWidthInputChange = (event, index) => {
        const widthValue = parseInt(event.target.value, 10);
        if (!isNaN(widthValue) && widthValue > 0) {
            setDimensions((prevDimensions) =>
                prevDimensions.map((data, i) => ({
                    ...data,
                    width: i === index ? widthValue : data.width,
                    height: calculateAspect ? Math.round(widthValue / aspectRatios[i]) : data.height,
                }))
            );
        }
    };

    // Helper function to handle height input change for a specific index
    const handleHeightInputChange = (event, index) => {
        const heightValue = parseInt(event.target.value, 10);
        if (!isNaN(heightValue) && heightValue > 0) {
            setDimensions((prevDimensions) =>
                prevDimensions.map((data, i) => ({
                    ...data,
                    width: calculateAspect ? Math.round(heightValue * aspectRatios[i]) : data.width,
                    height: i === index ? heightValue : data.height,
                }))
            );
        }
    };
    
    

    const handleAspectCheckboxChange = (event) => {
        setCalculateAspect(event.target.checked);
    };

    // Event handler for drag and drop
    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer.files;

        if (!files || files.length === 0) {
            setImageUploaded(false);
            return;
        }

        setImageUploaded(true);

        // Handle each file in the files array
        const filesArray = Array.from(files);
        setUploadedFiles(filesArray);

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Check the aspect ratio and set the initial width and height accordingly
                    const originalAspectRatio = img.width / img.height;
                    setOriginalAspectRatio(originalAspectRatio);
                    setInitialImageDimensions(img); // Set initial width and height for the dropped image

                    if (calculateAspect) {
                        setWidth(img.width);
                        setHeight(img.height);
                    }
                };
                img.src = event.target.result;


            };

            reader.readAsDataURL(file);
        }
    };


    
    const handleImageUpload = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event.target.files;

        if (!files || files.length === 0) {
            setImageUploaded(false);
            return;
        }

        setImageUploaded(true);

        // Handle each file in the files array
        const filesArray = Array.from(files);
        setUploadedFiles(filesArray);

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Check the aspect ratio and set the initial width and height accordingly
                    const originalAspectRatio = img.width / img.height;
                    setOriginalAspectRatio(originalAspectRatio);
                    setInitialImageDimensions(img); // Set initial width and height for the dropped image

                    if (calculateAspect) {
                        setWidth(img.width);
                        setHeight(img.height);
                    }
                };
                img.src = event.target.result;


            };

            reader.readAsDataURL(file);
        }
    };

    const downloadResizedImage = (blob, filename) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Prevent default behavior on dragover to enable drop
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

    };

    useEffect(() => {
        // This effect is used to update dimensions when imageData changes
        const newDimensions = imageData.map((data) => ({ width: data.width, height: data.height }));
        setDimensions(newDimensions);
    }, [imageData]);

    useEffect(() => {
        // Function to set dimensions for each uploaded image
        const setDimensionsForUploadedImages = async () => {
        const promises = uploadedFiles.map((file) => getImageData(file));
    
        const imageDataArray = await Promise.all(promises);
    
        setImageData(imageDataArray);
    
        // Update dimensions for each image separately
        const newDimensions = imageDataArray.map((data) => ({
            width: data.width,
            height: data.height,
        }));
        setDimensions(newDimensions);
        };
    
        // Call the function only when uploadedFiles change
        if (uploadedFiles.length > 0) {
        setDimensionsForUploadedImages();
        }
    }, [uploadedFiles]);

    

    const renderUploadedImages = () => {
        return uploadedFiles.map((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            return (
                <div className='col-lg-4 col-md-4 col-sm-6 col-xs-12'>
                <div key={index} className="image-container">
                    <img src={imageUrl} alt={`Image ${index + 1}`} className="uploaded-image" />
                    <span> W : px </span>
                    <input
                        type="number"
                        placeholder="Width in pixels"
                        value={dimensions[index]?.width || ''}
                        onChange={(event) => handleWidthInputChange(event, index)}
                        disabled={!imageUploaded}
                        className="width-inputs"
                    />

                        <span> H : px </span>

                    <input
                        type="number"
                        placeholder="Height in pixels"
                        value={dimensions[index]?.height || ''}
                        onChange={(event) => handleHeightInputChange(event, index)}
                        disabled={!imageUploaded}
                        className="height-inputs"
                    />
                </div>
                </div>
            );
        });
    };

    

    

    return (
        <>
        <div className='made-by'>
            Made By <a target='_blank' href="https://abdulrhmanelsawy.github.io/abdelrhman-elsawy/"> Abdelrhman Elsawy </a>
        </div>
        <section className='landing'>
            <div className='container-fluid'>
            <div className='landing-content'>
                <div className='row'>

            <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                <div className='generalinputs'>

                    <label>
                    Calculate Aspect Ratio:
                    <input
                        type='checkbox'
                        checked={calculateAspect}
                        onChange={handleAspectCheckboxChange}
                        disabled={!imageUploaded}
                    />
                    </label>

                    <button className='resize-btn' onClick={handleResize} disabled={!imageUploaded}>
                    Resize and Download
                    </button>


                    <span> H : px </span>

                    <input
                        type='number'
                        name='height-all'
                        id='heightAll'
                        onChange={handleHeightAllChange}
                    />
                    <span> W : px </span>

                    <input
                        type='number'
                        name='width-all'
                        id='widthAll'
                        onChange={handleWidthAllChange}
                    />

                    
                    </div>

                    </div>

                {renderUploadedImages()}

                <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                    <div
                    id='fileInput'
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragOver}
                    onClick={(e) => {
                        document.getElementById('fileInput').click();
                    }}
                    >
                    <input
                        type='file'
                        name='img'
                        multiple
                        onChange={handleImageUpload}
                    />
                    <p>Drag &amp; Drop or Click to Upload Images</p>
                    </div>
                </div>

                </div>


            

            </div>
            </div>
        </section>
        </>
    );
}

export default Landing;
