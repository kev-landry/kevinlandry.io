import siteMetadata from '@/data/siteMetadata'
// import headerNavLinks from '@/data/headerNavLinks'
// import Logo from '@/data/logo.png'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import { ReactNode } from 'react'
import Image from '@/components/Image'

interface Props {
  children: ReactNode
}

const LayoutWrapper = ({ children }: Props) => {
  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <Image
                    src="/public/static/image/avatar.png"
                    width={150}
                    height={150}
                    alt="site logo"
                  />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="hidden h-6 text-2xl font-semibold sm:block">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="flex items-center text-base leading-5">
            {/* For now no need other pages */}
            {/* <div className="hidden sm:block">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="p-1 font-medium text-gray-900 dark:text-gray-100 sm:p-4"
                >
                  {link.title}
                </Link>
              ))}
            </div> */}
            <ThemeSwitch />
            <MobileNav />
          </div>
        </header>
        <Footer />
        <main className="mb-auto">{children}</main>
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
