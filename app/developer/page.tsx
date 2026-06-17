import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Code2, GraduationCap, Instagram, Linkedin, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Developer | Vishvarajsinh Zala',
  description: 'Developer information for Vishvarajsinh Zala.',
}

const profile = {
  name: 'Vishvarajsinh Zala',
  role: 'Developer',
  education: "IT LDCE'27",
  location: 'Ahmedabad, Gujarat',
  photo: '/DSC_3747 - Copy (2)(3).JPG',
  linkedin: 'https://www.linkedin.com/in/vishvarajsinh-zala',
  instagram: 'https://www.instagram.com/vishvarajsinh_zala_007',
}

export default function DeveloperPage() {
  return (
    <div className="gradient-bg min-h-screen">
      <section className="container-custom py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
          <div className="relative max-w-md mx-auto lg:mx-0 w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-primary-600 rounded-[2rem] rotate-3 opacity-25 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900">
              <Image
                src={profile.photo}
                alt="Vishvarajsinh Zala"
                width={900}
                height={1100}
                priority
                className="w-full aspect-[4/5] object-cover object-center"
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold mb-5">
              <Code2 className="w-4 h-4" />
              Portal Developer
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {profile.name}
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Student developer from L.D. College of Engineering, focused on building clean,
              useful web applications for academic workflows.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Education</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.education}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-6 py-3 font-medium text-gray-800 shadow-md transition-all duration-300 hover:bg-pink-100 hover:shadow-lg dark:border-pink-800/50 dark:bg-pink-950/40 dark:text-gray-100 dark:hover:bg-pink-900/60"
              >
                <Instagram className="w-5 h-5 text-[#E4405F]" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
