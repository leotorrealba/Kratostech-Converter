import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

export interface HeaderProps {
  locale: string;
}

const Header: React.FC<HeaderProps> = ({ locale }) => {
  const router = useRouter()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/KTImagotipo.svg" alt="KratosTech Logo" width={200} height={120} />
        </Link>
        <Link
          href={locale === 'es' ? '/en' : '/'}
          className="bg-orange text-white px-3 py-1 rounded hover:bg-navy transition-colors"
        >
          {locale === 'es' ? 'EN' : 'ES'}
        </Link>
      </div>
    </header>
  );
};

export default Header;