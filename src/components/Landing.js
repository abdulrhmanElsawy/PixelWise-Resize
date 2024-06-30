import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Helmet } from 'react-helmet';
import './css/landing.css';

function Landing() {
    const [link, setLink] = useState('');
    const [logo, setLogo] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const qrCodeRef = useRef(null);

    const handleLinkChange = (e) => {
        setLink(e.target.value);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateQrCode = () => {
        const canvas = qrCodeRef.current.querySelector('canvas');
        const qrCodeUrl = canvas.toDataURL('image/png');
        setQrCode(qrCodeUrl);
    };

    const handleDownloadPdf = async () => {
        const container = qrCodeRef.current;

        // Use html2canvas to capture the content of the container
        const canvas = await html2canvas(container);

        // Convert the canvas to an image
        const imgData = canvas.toDataURL('image/png');

        // Get dimensions of the QR code container
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Create a new jsPDF instance with dimensions of the container
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [containerWidth, containerHeight]
        });

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, containerWidth, containerHeight);

        // Save the PDF
        pdf.save('QRCode.pdf');
    };

    return (
        <>
            <Helmet>
                <title>QR Code Generator - Free & Easy QR Code Creation</title>
                <meta name="description" content="Generate QR codes easily and for free. Customize your QR codes with logos and download them as PDFs. Perfect for businesses, events, and personal use." />
                <meta name="keywords" content="QR code generator, free QR code, QR code maker, custom QR codes, QR code with logo, download QR code, QR code PDF, QR code generator online" />
                <meta name="author" content="Abdelrhman Elsawy" />
                <meta property="og:title" content="QR Code Generator - Free & Easy QR Code Creation" />
                <meta property="og:description" content="Generate QR codes easily and for free. Customize your QR codes with logos and download them as PDFs. Perfect for businesses, events, and personal use." />
                <meta property="og:url" content="https://abdulrhmanelsawy.github.io/QRGenerator" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="path/to/your/image.jpg" />
            </Helmet>

            <div className='made-by'>
                Made By <a target='_blank' href="https://abdulrhmanelsawy.github.io/abdelrhman-elsawy/">Abdelrhman Elsawy</a>
            </div>
            <section className='landing'>
                <div className='container-fluid'>
                    <div className='landing-content'>
                        <div className='generalinputs'>
                            <div className='another-tools'>
                                <h6>Other Tools</h6>
                                <a href='https://abdulrhmanelsawy.github.io/ChormaSelect/'>Chroma Select</a>
                                <a href='https://abdulrhmanelsawy.github.io/FormatFlipper/'>Format Flipper</a>
                            </div>
                            <label>Website Link:</label>
                            <input
                                type='text'
                                value={link}
                                onChange={handleLinkChange}
                                placeholder='Enter the URL for QR Code'
                            />
                            <button className='resize-btn' onClick={handleGenerateQrCode}>
                                Generate QR Code
                            </button>
                            <button className='resize-btn' onClick={handleDownloadPdf} disabled={!qrCode}>
                                Download as PDF
                            </button>
                            <h1>QR Code Generator</h1>
                            <p>Create custom QR codes easily. Add logos and download as PDF.</p>
                        </div>
                        <div id='fileInput'>
                            <input
                                type='file'
                                name='logo'
                                onChange={handleLogoUpload}
                            />
                            <p>Upload Company Logo (optional)</p>
                            <div ref={qrCodeRef} className="qr-code-container">
                                <QRCodeCanvas
                                    id='qrCodeCanvas'
                                    value={link}
                                    size={256}
                                />
                                {logo && (
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="qr-logo"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <style jsx>{`
                .qr-code-container {
                        position: relative;
                        display: inline-block;
                        background-color: #fff;
                        width: 280px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        height: 280px;
                }
                .qr-logo {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.3;
                    object-fit: contain;
                }
            `}</style>
        </>
    );
}

export default Landing;
