import React from 'react'

interface FooterProps {
  locale: string;
}

const Footer: React.FC<FooterProps> = ({ locale }) => {
  return (
    <footer className="bg-navy text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>
          {locale === 'es' ? 'Desarrollado por ' : 'Developed by '}
          <a href="https://kratostech.net" target="_blank" rel="noopener noreferrer" className="text-orange hover:underline">
            KratosTech
          </a>
          . {locale === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;