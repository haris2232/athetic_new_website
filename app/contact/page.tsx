"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Mail } from "lucide-react"; 
import Header from "@/components/layout/header"; 
import Footer from "@/components/layout/footer"; 

// Using the path specified by the user
const HERO_IMAGE_PATH = "/images/contact-new.png"; 

// Custom Input/Textarea component for consistent styling and state handling
const FormField = ({ placeholder, type = 'text', isTextarea = false, halfWidth = false, name, value, onChange }: { 
    placeholder: string, 
    type?: string, 
    isTextarea?: boolean, 
    halfWidth?: boolean,
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) => {
    // Styling: White background, thin gray border, gray focus ring
    const className = `w-full p-4 bg-white border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 text-lg transition-colors ${
        halfWidth ? 'md:col-span-1' : 'col-span-full'
    }`;
    
    if (isTextarea) {
        return (
            <textarea
                name={name}
                placeholder={placeholder}
                aria-label={placeholder.replace('*', '')}
                rows={10}
                className={className + " resize-none"}
                value={value}
                onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
                required
            ></textarea>
        );
    }

    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            aria-label={placeholder.replace('*', '')}
            className={className}
            value={value}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            required
        />
    );
};


export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // API call to the correct /api/contact route
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', lastName: '', subject: '', message: '' }); 
                alert('Success! Your message has been sent.');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            alert('Error! Failed to send message. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            
            <Header />
            
            <main className="flex-grow">
                {/* Top Section: Image and Form */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        
                        {/* Left Column: Image Block */}
                        <div className="relative h-[450px] md:h-[600px] w-full rounded-[50px] overflow-hidden">
                            <Image
                                src={HERO_IMAGE_PATH}
                                alt="A man wearing a gym cap" 
                                layout="fill"
                                objectFit="contain"
                                objectPosition="center"
                                className="p-8 rounded-[50px]" 
                                priority
                            />
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="p-0"> 
                            <h1 
                                className="text-3xl md:text-4xl font-extrabold mb-2 uppercase" 
                                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                            >
                                CONTACT US
                            </h1>
                            <p className="text-lg mb-8 font-medium">
Feel free to contact with us, we don't spam your email                            </p>

                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
                                
                                <div className="col-span-1">
                                    <FormField 
                                        placeholder="Name*" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        halfWidth={true} 
                                    />
                                </div>
                                <div className="col-span-1">
                                    <FormField 
                                        placeholder="Last Name*" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        halfWidth={true} 
                                    />
                                </div>

                                <div className="col-span-2 mt-2">
                                    <FormField 
                                        placeholder="Subject*" 
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-span-2 mt-2">
                                    <FormField 
                                        placeholder="Message*" 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        isTextarea={true} 
                                    />
                                </div>
                                
                                <div className="col-span-2 mt-4">
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-black text-white font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Section: Support Contact Blocks */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Call Us Block */}
                        <div className="flex flex-col items-center justify-center p-10 bg-white shadow-lg rounded-lg text-center border border-gray-100">
                            <div className="mb-4 p-4 rounded-full bg-black"> 
                                <Phone className="w-8 h-8" style={{ color: '#D5FB32' }} />
                            </div>
                            <h2 className="text-xl font-medium mb-2 uppercase tracking-wider">CALL US FOR SUPPORT:</h2>
                            <p className="text-2xl font-extrabold tracking-wider">000 0644267</p>
                        </div>

                        {/* Email Us Block */}
                        <div className="flex flex-col items-center justify-center p-10 bg-white shadow-lg rounded-lg text-center border border-gray-100">
                            <div className="mb-4 p-4 rounded-full bg-black"> 
                                <Mail className="w-8 h-8" style={{ color: '#D5FB32' }} />
                            </div>
                            <h2 className="text-xl font-medium mb-2 uppercase tracking-wider">EMAIL US ANYTIME:</h2>
                            <a 
                                href="mailto:info@athlekt.com" 
                                className="text-2xl font-extrabold tracking-wider hover:text-blue-600 transition-colors break-words"
                            >info@athlekt.com</a>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
            
        </div>
    );
}