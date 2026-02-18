"use client"

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Award, BookOpen, Users, Target, Sparkles, CheckCircle2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

const features = [
  {
    icon: Award,
    title: 'Excellence in Education',
    description: 'Join a prestigious institution known for academic excellence and innovation'
  },
  {
    icon: Users,
    title: 'Collaborative Environment',
    description: 'Work with talented faculty and motivated students in a supportive atmosphere'
  },
  {
    icon: Target,
    title: 'Flexible Work Engagement',
    description: 'Choose lecture sessions, lab work, or both based on your expertise and availability'
  },
  {
    icon: BookOpen,
    title: 'Diverse Academic Subjects',
    description: 'Teach in various engineering disciplines and share your industry knowledge'
  }
]

const stats = [
  { value: '16', label: 'Engineering Colleges' },
  { value: '50,000+', label: 'Students to Impact' },
  { value: '150+', label: 'Departments Across Gujarat' },
  { value: '2,500+', label: 'Faculty Community' },
  { value: '25+', label: 'Engineering Disciplines' },
  { value: '10,000+', label: 'Annual Graduates' },
  { value: '1,000+', label: 'Research Publications' },
  { value: '5,000+', label: 'Alumni Network (yearly)' },
  { value: '50+', label: 'Industry Partnerships' }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function HomePage() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      const offset = window.innerHeight / 2 - featuresSection.offsetHeight / 2
      const elementPosition = featuresSection.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero Section */}
      <section className="container-custom pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Join Our Academic Excellence
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 dark:from-primary-400 dark:via-accent-400 dark:to-primary-400 bg-clip-text text-transparent leading-tight">
            Professor in Practise & Visiting Faculty - Application Portal
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 text-balance">
            Join Government Engineering Colleges as a Professor in Practice or Visiting Faculty and Shape the Future of Engineering Education
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative btn-primary text-lg px-8 py-4 w-full sm:w-auto overflow-hidden group"
              >
                <span className="relative z-10">Apply Now</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
                <span className="absolute bottom-0 left-0 w-0 h-full bg-black/20 transition-all duration-700 ease-out group-hover:w-full rounded-xl -z-0"></span>
              </motion.button>
            </Link>
            <Link href="/vacancy">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative btn-primary text-lg px-8 py-4 w-full sm:w-auto overflow-hidden group"
              >
                <span className="relative z-10">Vacancies</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
                <span className="absolute bottom-0 left-0 w-0 h-full bg-black/20 transition-all duration-700 ease-out group-hover:w-full rounded-xl -z-0"></span>
              </motion.button>
            </Link>
          </div>

          <div className="mt-4 flex justify-center">
            <motion.button
              onClick={scrollToFeatures}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300 text-lg overflow-hidden group"
            >
              <span className="relative z-10">Learn More</span>
              <span className="absolute bottom-0 left-0 w-0 h-full bg-black/10 dark:bg-white/10 transition-all duration-700 ease-out group-hover:w-full rounded-xl -z-0"></span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-32"
        >
          {/* First row - 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {stats.slice(0, 4).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-gray-100 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600 transition-all duration-300 text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-3">
                    {!isNaN(parseInt(stat.value.replace(/[+,]/g, ''))) ? (
                      <>
                        <CountUp end={parseInt(stat.value.replace(/[+,]/g, ''))} />
                        {stat.value.includes('+') && '+'}
                      </>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Second row - 3 columns centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            {stats.slice(4, 7).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-gray-100 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600 transition-all duration-300 text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-3">
                    {!isNaN(parseInt(stat.value.replace(/[+,]/g, ''))) ? (
                      <>
                        <CountUp end={parseInt(stat.value.replace(/[+,]/g, ''))} />
                        {stat.value.includes('+') && '+'}
                      </>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Third row - 2 columns centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {stats.slice(7, 9).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-gray-100 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600 transition-all duration-300 text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-3">
                    {!isNaN(parseInt(stat.value.replace(/[+,]/g, ''))) ? (
                      <>
                        <CountUp end={parseInt(stat.value.replace(/[+,]/g, ''))} />
                        {stat.value.includes('+') && '+'}
                      </>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Why Join Engineering Colleges?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Become part of a vibrant academic community committed to excellence
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -10 }}
              className="card card-hover text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 flex justify-center">
          <Link href="/resources">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-10 py-4"
            >
              Check Resources
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            Application Process
          </h2>
          
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-500 transform -translate-x-1/2" />
            
            <div className="space-y-5">
              {[
                {
                  step: 1,
                  title: 'Fill out the online Application Form with your details',
                  align: 'left'
                },
                {
                  step: 2,
                  title: 'Specify your College, Departments, Preferred Subjects and Time Slots',
                  align: 'right'
                },
                {
                  step: 3,
                  title: 'Submit your CV/Resume and Academic Credentials',
                  align: 'left'
                },
                {
                  step: 4,
                  title: 'Our Team will Carefully Review your Application',
                  align: 'right'
                },
                {
                  step: 5,
                  title: 'Selected Candidates will be Contacted for further process by Respective Departmtent of College',
                  align: 'left'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: item.align === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative grid grid-cols-2 gap-8 items-center ${
                    item.align === 'right' ? 'text-left' : 'text-right'
                  }`}
                >
                  {/* Left side content */}
                  {item.align === 'left' ? (
                    <>
                      <div className="pr-12">
                        <div className="inline-block mb-2">
                          <span className="text-orange-600 dark:text-orange-400 font-bold text-sm tracking-wider">
                            STEP {item.step}
                          </span>
                        </div>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {item.title}
                        </p>
                      </div>
                      <div />
                    </>
                  ) : (
                    <>
                      <div />
                      <div className="pl-12">
                        <div className="inline-block mb-2">
                          <span className="text-orange-600 dark:text-orange-400 font-bold text-sm tracking-wider">
                            STEP {item.step}
                          </span>
                        </div>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {item.title}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Center circle */}
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-6 h-6 rounded-full bg-orange-600 border-4 border-white dark:border-gray-900 shadow-lg z-10" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <Link href="/apply">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-10 py-4"
              >
                Start Your Application
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative perspective-1000"
        >
          {/* Outer container with rotation */}
          <div className="relative rounded-3xl bg-gradient-to-br from-orange-600 via-orange-700 to-amber-800 p-4 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
            {/* Inner container with opposite rotation */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-700 p-12 md:p-16 text-center text-white transform rotate-[4deg] scale-95">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Make an Impact?
                </h2>
                <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Join us in Shaping the Future of Engineering Education and Inspire the next Generation of Innovators
                </p>
                <div className="transform -rotate-[2deg]">
                  <Link href="/apply">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                    >
                      Apply Now
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
