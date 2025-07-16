import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Github, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@radix-ui/themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// This would typically come from a database or CMS
const projectsData = {
  "ecommerce-platform": {
    title: "E-commerce Platform",
    description:
      "A comprehensive e-commerce solution built with modern web technologies, featuring user authentication, payment processing, inventory management, and admin dashboard.",
    longDescription:
      "This full-stack e-commerce platform was designed to provide a seamless shopping experience for customers while offering powerful management tools for administrators. The project includes features such as product catalog management, shopping cart functionality, secure payment processing through Stripe, order tracking, and comprehensive analytics.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    tags: ["React", "Node.js", "MongoDB", "Stripe", "Express", "JWT"],
    category: "Web Development",
    duration: "3 months",
    client: "Retail Startup",
    liveUrl: "https://example-ecommerce.com",
    githubUrl: "https://github.com/example/ecommerce",
    features: [
      "User authentication and authorization",
      "Product catalog with search and filtering",
      "Shopping cart and checkout process",
      "Payment processing with Stripe",
      "Order management system",
      "Admin dashboard with analytics",
      "Responsive design for all devices",
      "Email notifications",
    ],
    challenges:
      "The main challenges included implementing secure payment processing, optimizing database queries for large product catalogs, and ensuring the application could handle high traffic during sales events.",
    technologies: {
      Frontend: ["React", "Redux", "Tailwind CSS", "React Router"],
      Backend: ["Node.js", "Express", "MongoDB", "Mongoose"],
      Payment: ["Stripe API", "Webhook handling"],
      Deployment: ["AWS EC2", "MongoDB Atlas", "Cloudflare"],
    },
  },
  "mobile-fitness-app": {
    title: "Mobile Fitness App",
    description:
      "A cross-platform mobile application for fitness tracking with workout plans, progress monitoring, and social features.",
    longDescription:
      "This comprehensive fitness application helps users track their workouts, monitor progress, and stay motivated through social features. Built with React Native for cross-platform compatibility, the app includes workout planning, exercise libraries, progress tracking, and community features.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    tags: ["React Native", "Firebase", "Redux", "Expo"],
    category: "Mobile Development",
    duration: "4 months",
    client: "Fitness Startup",
    liveUrl: "https://app-store-link.com",
    githubUrl: "https://github.com/example/fitness-app",
    features: [
      "Workout tracking and planning",
      "Exercise library with instructions",
      "Progress monitoring and analytics",
      "Social features and challenges",
      "Nutrition tracking",
      "Wearable device integration",
      "Offline mode support",
      "Push notifications",
    ],
    challenges:
      "Key challenges included optimizing performance for older devices, implementing offline functionality, and integrating with various fitness wearables and health platforms.",
    technologies: {
      Mobile: ["React Native", "Expo", "React Navigation"],
      "State Management": ["Redux", "Redux Persist"],
      Backend: ["Firebase", "Cloud Functions", "Firestore"],
      Analytics: ["Firebase Analytics", "Crashlytics"],
    },
  },
  "ai-chatbot": {
    title: "AI Customer Support Bot",
    description:
      "An intelligent chatbot system for automated customer support with natural language processing capabilities.",
    longDescription:
      "This AI-powered chatbot was developed to handle customer inquiries automatically, reducing response times and improving customer satisfaction. The system uses advanced NLP techniques to understand user queries and provide relevant responses.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
    tags: ["Python", "TensorFlow", "NLP", "FastAPI", "Docker"],
    category: "AI/ML",
    duration: "2 months",
    client: "Tech Company",
    liveUrl: "https://chatbot-demo.com",
    githubUrl: "https://github.com/example/ai-chatbot",
    features: [
      "Natural language understanding",
      "Intent recognition and classification",
      "Multi-language support",
      "Integration with existing systems",
      "Analytics and reporting",
      "Continuous learning capabilities",
      "Escalation to human agents",
      "API for third-party integration",
    ],
    challenges:
      "The primary challenges were training the model with sufficient data, handling edge cases in natural language understanding, and ensuring the bot could gracefully hand off to human agents when needed.",
    technologies: {
      "AI/ML": ["TensorFlow", "NLTK", "spaCy", "Transformers"],
      Backend: ["Python", "FastAPI", "PostgreSQL"],
      Deployment: ["Docker", "Kubernetes", "AWS"],
      Monitoring: ["Prometheus", "Grafana", "ELK Stack"],
    },
  },
  "dashboard-analytics": {
    title: "Analytics Dashboard",
    description:
      "A real-time data visualization platform for business analytics with interactive charts and reporting features.",
    longDescription:
      "This comprehensive analytics dashboard provides businesses with real-time insights into their operations through interactive visualizations and customizable reports. The platform processes large datasets and presents them in an intuitive, user-friendly interface.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    tags: ["Vue.js", "D3.js", "PostgreSQL", "Docker", "WebSocket"],
    category: "Data Visualization",
    duration: "5 months",
    client: "Enterprise Client",
    liveUrl: "https://analytics-dashboard.com",
    githubUrl: "https://github.com/example/analytics-dashboard",
    features: [
      "Real-time data visualization",
      "Interactive charts and graphs",
      "Customizable dashboards",
      "Data filtering and drilling",
      "Export functionality",
      "User role management",
      "Scheduled reports",
      "Mobile responsive design",
    ],
    challenges:
      "The main challenges included handling large datasets efficiently, ensuring real-time updates without performance issues, and creating intuitive visualizations for complex data relationships.",
    technologies: {
      Frontend: ["Vue.js", "Vuex", "D3.js", "Chart.js"],
      Backend: ["Node.js", "Express", "PostgreSQL"],
      "Real-time": ["WebSocket", "Redis"],
      Infrastructure: ["Docker", "Nginx", "AWS"],
    },
  },
  "blockchain-wallet": {
    title: "Crypto Wallet",
    description: "A secure cryptocurrency wallet application with multi-chain support and DeFi integration.",
    longDescription:
      "This cryptocurrency wallet provides users with a secure way to store, send, and receive digital assets across multiple blockchain networks. The application includes advanced security features and integration with decentralized finance protocols.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
    tags: ["Solidity", "Web3.js", "React", "Ethereum", "MetaMask"],
    category: "Blockchain",
    duration: "6 months",
    client: "Crypto Startup",
    liveUrl: "https://crypto-wallet.com",
    githubUrl: "https://github.com/example/crypto-wallet",
    features: [
      "Multi-chain support",
      "Secure key management",
      "Transaction history",
      "DeFi protocol integration",
      "NFT support",
      "Hardware wallet integration",
      "Price tracking",
      "Staking capabilities",
    ],
    challenges:
      "Security was the primary concern, along with ensuring compatibility across different blockchain networks and providing a user-friendly interface for complex blockchain operations.",
    technologies: {
      Blockchain: ["Solidity", "Web3.js", "Ethers.js"],
      Frontend: ["React", "TypeScript", "Tailwind CSS"],
      Security: ["Hardware Security Modules", "Encryption"],
      Integration: ["MetaMask", "WalletConnect", "Ledger"],
    },
  },
  "social-media-app": {
    title: "Social Media Platform",
    description:
      "A modern social networking application with real-time messaging, content sharing, and community features.",
    longDescription:
      "This social media platform was built to connect users through shared interests and real-time communication. The application includes features for content creation, social interaction, and community building with a focus on user engagement and safety.",
    image: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    tags: ["Next.js", "Socket.io", "Redis", "AWS", "PostgreSQL"],
    category: "Social Media",
    duration: "8 months",
    client: "Social Media Startup",
    liveUrl: "https://social-platform.com",
    githubUrl: "https://github.com/example/social-media",
    features: [
      "User profiles and authentication",
      "Real-time messaging",
      "Content sharing and feeds",
      "Like, comment, and share functionality",
      "Group and community features",
      "Media upload and processing",
      "Notification system",
      "Content moderation tools",
    ],
    challenges:
      "Scaling real-time features for thousands of concurrent users, implementing effective content moderation, and ensuring data privacy and security were the main technical challenges.",
    technologies: {
      Frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      Backend: ["Node.js", "Express", "PostgreSQL"],
      "Real-time": ["Socket.io", "Redis"],
      Infrastructure: ["AWS", "CloudFront", "S3", "RDS"],
    },
  },
}

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = projectsData[params.id as keyof typeof projectsData]

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/projects">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Image
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                width={800}
                height={400}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            </div>
            <div className="lg:w-1/3">
              <Badge className="mb-4">{project.category}</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

              <div className="flex gap-4 mb-6">
                {project.liveUrl && (
                  <Button asChild>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button variant="outline" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Duration: {project.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Client: {project.client}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{project.longDescription}</p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Challenges & Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{project.challenges}</p>
              </CardContent>
            </Card>

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.gallery.map((image, index) => (
                      <Image
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${project.title} screenshot ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(project.technologies).map(([category, techs]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-sm mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {techs.map((tech) => (
                          <Badge key={tech}  className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
