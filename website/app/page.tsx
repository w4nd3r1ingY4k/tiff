// pages/page.jsx or app/page.jsx

import '@root/global.scss';

import * as Constants from '@common/constants';
import * as Utilities from '@common/utilities';
import React from 'react'; // Not necessary since Next.js 13, but included if needed
import Accordion from '@components/Accordion';
import ActionBar from '@components/ActionBar';
import ActionButton from '@components/ActionButton';
import ActionListItem from '@components/ActionListItem';
import AlertBanner from '@components/AlertBanner';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import BarLoader from '@components/BarLoader';
import BarProgress from '@components/BarProgress';
import Block from '@components/Block';
import BlockLoader from '@components/BlockLoader';
import Breadcrumbs from '@components/BreadCrumbs';
import Button from '@components/Button';
import CanvasPlatformer from '@components/CanvasPlatformer';
import CanvasSnake from '@components/CanvasSnake';
import Card from '@components/Card';
import CardDouble from '@components/CardDouble';
import Checkbox from '@components/Checkbox';
import DataTable from '@components/DataTable';
import DatePicker from '@components/DatePicker';
import DebugGrid from '@components/DebugGrid';
import DefaultActionBar from '@components/page/DefaultActionBar';
import DefaultLayout from '@components/page/DefaultLayout';
import Grid from '@components/Grid';
import Indent from '@components/Indent';
import Input from '@components/Input';
import IntDevLogo from '@components/svg/IntDevLogo';
import ListItem from '@components/ListItem';
import MatrixLoader from '@components/MatrixLoader';
import Message from '@components/Message';
import MessageViewer from '@components/MessageViewer';
import ModalAlert from '@components/modals/ModalAlert';
import ModalCreateAccount from '@components/modals/ModalCreateAccount';
import ModalStack from '@components/ModalStack';
import ModalTrigger from '@components/ModalTrigger';
import NumberRangeSlider from '@components/NumberRangeSlider';
import Package from '@root/package.json';
import RadioButtonGroup from '@components/RadioButtonGroup';
import Row from '@components/Row';
import Script from 'next/script';
import Text from '@components/Text';
import TextArea from '@components/TextArea';
import UpdatingDataTable from '@components/examples/UpdatingDataTable';

import InteractiveMessages from './interactiveMessages'; // Import the Client Component

export const dynamic = 'force-static';

export async function generateMetadata({ params, searchParams }) {
  const title = Package.name;
  const description = Package.description;
  const url = 'https://sacred.computer';
  const handle = '@internetxstudio';

  return {
    description,
    icons: {
      apple: [{ url: '/apple-touch-icon.png' }, { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      icon: '/favicon-32x32.png',
      other: [
        {
          rel: 'apple-touch-icon-precomposed',
          url: '/apple-touch-icon-precomposed.png',
        },
      ],
      shortcut: '/favicon-16x16.png',
    },
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

const SAMPLE_TABLE_DATA_CHANGE_ME = [
  ['NAME', 'SYMBOL', 'PRICE', 'HOLDINGS'],
  ['Bat', 'BAT', '$9.01', '400'],
  ['Bear', 'BR', '$56.78', '200'],
  ['Camel', 'CML', '$55.67', '70'],
  ['Cheetah', 'CHT', '$13.45', '150'],
  ['Crab', 'CRB', '$15.67', '250'],
  ['Deer', 'DER', '$29.99', '110'],
  ['Dolphin', 'DLP', '$77.89', '50'],
  ['Eagle', 'EGL', '$45.67', '90'],
  ['Falcon', 'FLC', '$40.22', '85'],
  ['Fox', 'FOX', '$12.34', '100'],
  ['Frog', 'FRG', '$7.89', '400'],
  ['Giraffe', 'GRF', '$44.56', '80'],
  ['Hedgehog', 'HDG', '$11.23', '200'],
  ['Horse', 'HRS', '$54.32', '70'],
  ['Kangaroo', 'KNG', '$15.67', '120'],
  ['Koala', 'KLA', '$22.34', '150'],
  ['Leopard', 'LPR', '$14.56', '110'],
  ['Lemur', 'LMR', '$11.12', '320'],
  ['Lion', 'LION', '$67.89', '80'],
  ['Lynx', 'LNX', '$16.78', '130'],
  ['Mouse', 'MSE', '$5.12', '500'],
  ['Octopus', 'OCT', '$88.90', '40'],
  ['Otter', 'OTR', '$20.21', '180'],
  ['Owl', 'OWL', '$19.01', '160'],
  ['Panda', 'PND', '$78.90', '55'],
  ['Peacock', 'PCK', '$12.34', '100'],
  ['Penguin', 'PNG', '$33.45', '90'],
  ['Porcupine', 'PRC', '$17.89', '140'],
  ['Rabbit', 'RBT', '$9.10', '350'],
  ['Raccoon', 'RCC', '$18.90', '150'],
  ['Shark', 'SHK', '$89.01', '50'],
  ['Snake', 'SNK', '$10.11', '300'],
  ['Squirrel', 'SQL', '$10.12', '250'],
  ['Tiger', 'TGR', '$34.56', '120'],
  ['Turtle', 'TRL', '$66.78', '60'],
  ['Whale', 'WHL', '$123.45', '30'],
  ['Wolf', 'WLF', '$23.45', '150'],
  ['Zebra', 'ZBR', '$65.43', '60'],
];

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
