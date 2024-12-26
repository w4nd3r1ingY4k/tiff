export const dynamic = 'force-static';
import Package from '@root/package.json';

export async function generateMetadata({ params, searchParams }) {
  const title = Package.name;
  const description = Package.description;
  const url = 'https://sacred.computer';

  return {
    description,
    metadataBase: new URL('https://wireframes.internet.dev'),
    openGraph: {
      description,
      images: [
        {
          url: 'https://next-s3-public.s3.us-west-2.amazonaws.com/social/social-sacred-computer.png',
          width: 1500,
          height: 785,
        },
      ],
      title,
      type: 'website',
      url,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      handle: '@internetxstudio',
      images: ['https://next-s3-public.s3.us-west-2.amazonaws.com/social/social-sacred-computer.png'],
      title,
      url,
    },
    url,
  };
}