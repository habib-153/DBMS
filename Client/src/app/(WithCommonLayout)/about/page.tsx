"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  Shield,
  Target,
  Users,
  Heart,
  Facebook,
  Linkedin,
  Github,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  MotionDiv,
  MotionH1,
  MotionH2,
  MotionH3,
  MotionP,
} from "@/src/components/motion-components";

// Team members data (4 team members)
const teamMembers = [
  {
    id: 1,
    name: "MD Mahidul Islam Mahi",
    role: "Team Leader",
    image: "https://stg-dsc-prod.monzim.com/panel-25/Mahi.JPG",
    social: {
      email: "mmahi2330150@bsds.uiu.ac.bd",
      linkedin: "https://www.linkedin.com/in/md-mahidul-islam-mahi-192759227",
      facebook: "https://www.facebook.com/kmmahidulislam.mahi",
      github: "https://github.com/Mitahi-1810",
    },
  },
  {
    id: 2,
    name: "Habibur Rahman",
    role: "Team Member(Full-Stack Development)",
    image:
      "https://res.cloudinary.com/drrhtmzpk/image/upload/v1741801227/Habibur_Rahman_image_2_k4muww.jpg",
    social: {
      email: "habibur.web04@gmail.com",
      linkedin: "https://www.linkedin.com/in/habiburrahman153/",
      facebook: "https://www.facebook.com/h.R4hM4n.8",
      github: "https://github.com/habib-153",
      portfolio: "https://habiburrahman-web.vercel.app/",
    },
  },
  {
    id: 3,
    name: "Faiyaz Rahman",
    role: "Team Member(Research & Development)",
    image: "https://stg-dsc-prod.monzim.com/panel-25/Faiyaz.JPG",
    social: {
      email: "faiyaaaz.rahman@gmail.com",
      linkedin: "https://www.linkedin.com/in/faiyaz-rahman-699189210",
      facebook: "",
      github: "https://github.com/faiyaaaz",
    },
  },
  {
    id: 4,
    name: "Redoan Arefin Siam",
    role: "Team Member(UI/UX Design)",
    image:
      "https://res.cloudinary.com/drrhtmzpk/image/upload/v1754575007/Siam.jpg",
    social: {
      email: "siamredoan@gmail.com",
      linkedin: "www.linkedin.com/in/siam-arefin-324b2027a",
      facebook: "https://www.facebook.com/siam.arefin.180",
      github: "",
    },
  },
];

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "We prioritize the safety and security of our community members above all else.",
  },
  {
    icon: Target,
    title: "Transparency",
    description:
      "We believe in open communication and transparent crime reporting processes.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Building a strong, supportive network where everyone can contribute to safety.",
  },
  {
    icon: Heart,
    title: "Empathy",
    description:
      "We approach every report with understanding and compassion for those affected.",
  },
];

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <MotionDiv
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#a50034] to-rose-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <MotionH1
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            variants={itemVariants}
          >
            About Us
          </MotionH1>
          <MotionP
            className="text-lg text-center max-w-3xl mx-auto text-white/90"
            variants={itemVariants}
          >
            Empowering communities to report, track, and prevent crime through
            innovative technology and collaborative action.
          </MotionP>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <MotionDiv
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          variants={itemVariants}
        >
          <MotionDiv variants={itemVariants} whileHover={{ scale: 1.01 }}>
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <MotionH2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Our Mission
                </MotionH2>
              </CardHeader>
              <CardBody>
                <MotionP className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To create safer communities by providing a transparent,
                  user-friendly platform for crime reporting and prevention. We
                  believe that by empowering citizens with the right tools and
                  information, we can collectively reduce crime and improve
                  public safety.
                </MotionP>
              </CardBody>
            </Card>
          </MotionDiv>

          <MotionDiv variants={itemVariants} whileHover={{ scale: 1.01 }}>
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-0">
                <MotionH2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Our Vision
                </MotionH2>
              </CardHeader>
              <CardBody>
                <MotionP className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  A world where every community has access to real-time crime
                  data, enabling proactive safety measures and fostering trust
                  between citizens and law enforcement. We envision a future
                  where technology bridges the gap in public safety.
                </MotionP>
              </CardBody>
            </Card>
          </MotionDiv>
        </MotionDiv>

        {/* Values Section */}
        <MotionDiv className="mb-16" variants={itemVariants}>
          <MotionH2
            className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100"
            variants={itemVariants}
          >
            Our Core Values
          </MotionH2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <MotionDiv
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="h-full text-center shadow-md hover:shadow-lg transition-all">
                  <CardBody className="flex flex-col items-center gap-4 p-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-[#a50034] to-rose-500 text-white">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <MotionH3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {value.title}
                    </MotionH3>
                    <MotionP className="text-sm text-gray-600 dark:text-gray-300">
                      {value.description}
                    </MotionP>
                  </CardBody>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* Team Section */}
        <MotionDiv variants={itemVariants}>
          <MotionH2
            className="text-4xl font-bold text-center mb-4 text-brand-primary dark:text-gray-100"
            variants={itemVariants}
          >
            Team Monsur Mithai
          </MotionH2>
          <MotionP
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Meet the dedicated team behind our crime reporting platform
          </MotionP>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <MotionDiv
                key={member.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                  <CardBody className="p-0">
                    <MotionDiv className="flex flex-col items-center text-center">
                      {/* Image Container */}
                      <MotionDiv className="relative w-full h-64 overflow-hidden">
                        <img
                          alt={member.name}
                          className="w-full h-full object-cover"
                          src={member.image}
                        />
                        {/* Gradient Overlay */}
                        {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /> */}
                      </MotionDiv>

                      {/* Content Container */}
                      <div className="p-6 w-full">
                        <MotionH3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          {member.name}
                        </MotionH3>
                        <MotionP className="text-[#a50034] font-semibold mb-4">
                          {member.role}
                        </MotionP>

                        {/* Social Links */}
                        <div className="p-4 flex justify-center space-x-4">
                          {member.social.email && (
                            <Link
                              className="text-muted-foreground hover:text-brand-primary"
                              href={`mailto:${member.social.email}`}
                            >
                              <Mail className="h-5 w-5" />
                              <span className="sr-only">Email</span>
                            </Link>
                          )}
                          {member.social.linkedin && (
                            <Link
                              className="text-muted-foreground hover:text-brand-primary"
                              href={member.social.linkedin}
                            >
                              <Linkedin className="h-5 w-5" />
                              <span className="sr-only">LinkedIn</span>
                            </Link>
                          )}
                          {member.social.facebook && (
                            <Link
                              className="text-muted-foreground hover:text-brand-primary"
                              href={member.social.facebook}
                            >
                              <Facebook className="h-5 w-5" />
                              <span className="sr-only">Facebook</span>
                            </Link>
                          )}
                          {member.social.github && (
                            <Link
                              className="text-muted-foreground hover:text-brand-primary"
                              href={member.social.github}
                            >
                              <Github className="h-5 w-5" />
                              <span className="sr-only">Github</span>
                            </Link>
                          )}
                          {member.social.portfolio && (
                            <Link
                              className="text-muted-foreground hover:text-brand-primary"
                              href={member.social.portfolio}
                            >
                              <Globe className="h-5 w-5" />
                              <span className="sr-only">Portfolio</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </MotionDiv>
                  </CardBody>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* Contact Section */}
        {/* <MotionDiv className="mt-12" variants={itemVariants}>
          <Card className="shadow-lg bg-gradient-to-br from-[#a50034] to-rose-600 text-white">
            <CardBody className="p-8">
              <MotionH2 className="text-2xl font-bold mb-6 text-center">
                Get In Touch
              </MotionH2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Mail className="w-6 h-6" />
                  <p className="font-semibold">Email</p>
                  <p className="text-sm opacity-90">contact@crimeportal.com</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Phone className="w-6 h-6" />
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm opacity-90">+1 (555) 123-4567</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  <p className="font-semibold">Location</p>
                  <p className="text-sm opacity-90">
                    123 Safety St, Secure City
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </MotionDiv> */}
      </div>
    </MotionDiv>
  );
}
