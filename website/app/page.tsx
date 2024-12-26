// pages/page.jsx or app/page.jsx

import '@root/global.scss';

import React from 'react'; // Not necessary since Next.js 13, but included if needed
import ActionButton from '@components/ActionButton';
import Badge from '@components/Badge';
import DefaultLayout from '@components/page/DefaultLayout';
import Grid from '@components/Grid';
import MatrixLoader from '@components/MatrixLoader';
import ModalCreateAccount from '@components/modals/ModalCreateAccount';
import ModalTrigger from '@components/ModalTrigger';
import Package from '@root/package.json';
import Row from '@components/Row';


import InteractiveMessages from './interactiveMessages'; // Import the Client Component

export const dynamic = 'force-static';

export async function generateMetadata({ params, searchParams }) {
  const title = Package.name;
  const description = Package.description;
  const url = 'https://sacred.computer';
  const handle = '@internetxstudio';

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
      handle,
      images: ['https://next-s3-public.s3.us-west-2.amazonaws.com/social/social-sacred-computer.png'],
      title,
      url,
    },
    url,
  };
}

export default function Page(props) {
  return (
    <DefaultLayout previewPixelSRC="https://intdev-global.s3.us-west-2.amazonaws.com/template-app-icon.png">
      <br />
      <Grid>
        <Row>
          {Package.name} <Badge>Version {Package.version}</Badge>
        </Row>
        <Row>{Package.description}</Row>
        <Row>{Package.beya}</Row>
        <Row>
          <ModalTrigger modal={ModalCreateAccount}>
            <ActionButton>Create Account</ActionButton>
          </ModalTrigger>
        </Row>
      </Grid>
      <br />
      <br />
      <br />
      {/* Interactive Messages Section */}
      <InteractiveMessages />
    </DefaultLayout>
  );
}
