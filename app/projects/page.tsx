import Image from "next/image"
import Link from "next/link"

import { Badge } from "@radix-ui/themes"
import React from 'react';
import type { Metadata } from 'next';
import { contact } from '@/data/contact';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import BlurFade from '@/components/ui/blur-fade';
import { AppSidebar } from '@/components/app-sidebar';
import Pathname from '@/components/pathname';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
const projects = [
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    description: "A modern e-commerce solution with React and Node.js",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "Web Development",
  },
  {
    id: "mobile-fitness-app",
    title: "Mobile Fitness App",
    description: "Cross-platform fitness tracking application",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["React Native", "Firebase", "Redux"],
    category: "Mobile Development",
  },
  {
    id: "ai-chatbot",
    title: "AI Customer Support Bot",
    description: "Intelligent chatbot for customer service automation",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["Python", "TensorFlow", "NLP", "FastAPI"],
    category: "AI/ML",
  },
  {
    id: "dashboard-analytics",
    title: "Analytics Dashboard",
    description: "Real-time data visualization and analytics platform",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["Vue.js", "D3.js", "PostgreSQL", "Docker"],
    category: "Data Visualization",
  },
  {
    id: "blockchain-wallet",
    title: "Crypto Wallet",
    description: "Secure cryptocurrency wallet with multi-chain support",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["Solidity", "Web3.js", "React", "Ethereum"],
    category: "Blockchain",
  },
  {
    id: "social-media-app",
    title: "Social Media Platform",
    description: "Modern social networking application with real-time features",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["Next.js", "Socket.io", "Redis", "AWS"],
    category: "Social Media",
  },
]

export default function ProjectsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='block'>
                <BreadcrumbLink href='/'>david</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Pathname />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>
          <div className='mt-10'>
            <BlurFade delay={0}>
              <h1 className='mb-8 text-2xl font-medium tracking-tight'>
                Contacts
              </h1>
            </BlurFade>
            <div className='min-h-screen bg-background'>
              <div className='container mx-auto px-4 py-12'>
                <div className='text-center mb-12'>
                  <h1 className='text-4xl font-bold tracking-tight mb-4'>
                    My Projects
                  </h1>
                  <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
                    A collection of projects I've worked on, showcasing various
                    technologies and solutions.
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <Card className='group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer'>
                        <div className='relative overflow-hidden'>
                          <Image
                            src={project.image || '/placeholder.svg'}
                            alt={project.title}
                            width={400}
                            height={300}
                            className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                          />
                          <div className='absolute top-4 left-4'>
                            <Badge>{project.category}</Badge>
                          </div>
                        </div>
                        <CardContent className='p-6'>
                          <h3 className='text-xl font-semibold mb-2 group-hover:text-primary transition-colors'>
                            {project.title}
                          </h3>
                          <p className='text-muted-foreground mb-4 line-clamp-2'>
                            {project.description}
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant='outline'
                                className='text-xs'
                              >
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant='outline' className='text-xs'>
                                +{project.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
