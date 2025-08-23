'use client'
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Homepage/Navbar'
import Footer from '@/components/Homepage/Footer'
import Image from 'next/image'

const TemplePage = () => {
  const [activeTab, setActiveTab] = useState('temple');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'iskcon-gaurangadham':
//         return <IskconGaurangadhamContent />;
//       case 'our-mission':
//         return <OurMissionContent />;
//       case 'founder-acharya':
//         return <FounderAcharyaContent />;
//       case 'our-beliefs':
//         return <OurBeliefsContent />;
//       case 'about-iskcon':
//       default:
//         return <AboutIskconContent />;
//     }
//   };

  return (
    <div>
      <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-8">
        
      <Head>
        <title>About temple</title>
        <meta name="description" content="Learn about ISKCON, its beliefs, history, and mission" />
      </Head>

      {/* Breadcrumbs */}
      <div className="text-sm text-gray-600 mb-6">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        <span> &gt; </span>
        <span className="text-blue-600 hover:underline cursor-pointer">Temple</span>
        {/* <span> &gt; </span>
        <span>International Society for Krishna Consciousness</span> */}
      </div>

      {/* Main Title */}
      <h1 className="text-3xl font-bold text-purple-800 border-b-2 border-purple-800 pb-3 mb-8">
        Temple
      </h1>

      {/* Content Wrapper */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav>
            <ul className="space-y-2">
              <li 
                className={`p-3 rounded cursor-pointer transition-colors ${
                  activeTab === 'temple' 
                    ? 'bg-gray-100 border-l-4 border-purple-800 font-semibold text-purple-800' 
                    : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => setActiveTab('temple')}
              >
                Temple
              </li>
              {/* <li 
                className={`p-3 rounded cursor-pointer transition-colors ${
                  activeTab === 'iskcon-gaurangadham' 
                    ? 'bg-gray-100 border-l-4 border-purple-800 font-semibold text-purple-800' 
                    : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => setActiveTab('iskcon-gaurangadham')}
              >
                ISKCON Shri Gauranga Dham
              </li>
              <li 
                className={`p-3 rounded cursor-pointer transition-colors ${
                  activeTab === 'our-mission' 
                    ? 'bg-gray-100 border-l-4 border-purple-800 font-semibold text-purple-800' 
                    : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => setActiveTab('our-mission')}
              >
                Our Mission
              </li>
              <li 
                className={`p-3 rounded cursor-pointer transition-colors ${
                  activeTab === 'founder-acharya' 
                    ? 'bg-gray-100 border-l-4 border-purple-800 font-semibold text-purple-800' 
                    : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => setActiveTab('founder-acharya')}
              >
                Founder Acharya
              </li>
              <li 
                className={`p-3 rounded cursor-pointer transition-colors ${
                  activeTab === 'our-beliefs' 
                    ? 'bg-gray-100 border-l-4 border-purple-800 font-semibold text-purple-800' 
                    : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => setActiveTab('our-beliefs')}
              >
                Our Beliefs
              </li> */}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <TempleIskconContent/>
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );
};

// Content Components
const TempleIskconContent = () => (
  <div className="space-y-6">
    <p className="text-gray-700 leading-relaxed">
      International Society for Krishna Consciousness, also popularly known as the Hare Krishna movement is a spiritual society founded by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada in July 1966 in New York. ISKCON belongs to the Gandiya-Vaidniawa sampradaya, a monotheistic tradition within Vedic culture.
    </p>
    <div>
        <Image src="/RadhaKrishna.jpeg" width={500} height={500} alt="Radha Krishna"/>
    </div>
    <p className="text-gray-700 leading-relaxed">
      Today ISKCON comprises of more than 400 temples, 40 rural communities and over 100 vegetarian restaurants. It also conducts special projects throughout the world, such as &ldquo;Food for Life&rdquo;, the only free vegetarian relief program in the world.
    </p>

    <h2 className="text-2xl font-semibold text-purple-800 mt-8 mb-4">Our Beliefs</h2>
    <p className="text-gray-700 leading-relaxed">
      The aim of ISKCON is to acquaint all people of world with universal principles of self-realization and God consciousness so that they may derive the highest benefit of spiritual understanding, unity and peace.
    </p>
    <p className="text-gray-700 leading-relaxed">
      The Vedic literature recommend that in the present age of Kaisi-yuga the most effective means of achieving self-realization is always hear about, glorify, and remember the all-attractive Supreme Lord Sri Krishna. Therefore, it recommends the chanting of the Holy Names: Hare Krishna Hare Krishna Krishna Krishna Hare Hare / Hare Rama Hare Rama Rama Hare Hare. This sublime chanting puts the chanter directly in touch with the Supreme Lord through the sound vibration of His Holy Name.
    </p>
    <p className="text-gray-700 leading-relaxed">
      ISKCON follows the teachings of the Vedas and Vedic scriptures, including the Bhagavad-gita and Srimad Bhagavatam which teach Vaishnavism or devotion to God (Krishna) in His Supreme Personal aspect of Sri Sri Radha Krishna.
    </p>
    <p className="text-gray-700 leading-relaxed">
      These teachings are received through the preceptorial line known as the Brahma-Madhav-Gandiya Vaishnava sampradaya. ISKCON is part of the disciple succession which started with Lord Krishna Himself and continued with Srila Vyssadeva, Srila Madhavacharya, Sri Cattanya Mahaprabhu and in the present day His Divine Grace A. C. Bhaktivedanta Swami Prabhupada and his followers.
    </p>
    <p className="text-gray-700 leading-relaxed">
      ISKCON&apos;s teachings are non-secretaria, following the principle of sanatana dharma or eternal religion, which denotes the eternal activity of all living beings – loving devotional service (bhakti-yoga) to Supreme Personality of Godhead.
    </p>

    <h2 className="text-2xl font-semibold text-purple-800 mt-8 mb-4">History of the Hare Krishna Movement</h2>
    <p className="text-gray-700 leading-relaxed">
      In 1965, at the age of 69, A. C. Bhaktivedanta Swami Prabhupada boarded the steamship &apos;Jaladura&apos; from Mumbai on his way to United States. At an age when most people think of retiring Srila Prabhupada undertook this arduous journey to fulfill the mission of Lord Cattanya and follow the instruction of his spiritual master Bhaktisiddhanta Saraswati Thakur to carry the message of Bhagavad-gita and Srimad Bhagavatam to Western world.
    </p>
    <p className="text-gray-700 leading-relaxed">
      After arriving in New York City in September 1965, Srila Prabhupada struggled alone for the first year to establish his Krishna conscious movement. He lived simply, lectured whenever and wherever he got the opportunity and gradually began to attract some small interest in his teaching. In July of 1966, while still working from an obscure storefront on New York City&apos;s Lower East Side, Srila Prabhupada nonetheless founded a spiritual society intended for worldwide participation. He called it International Society for Krishna Consciousness or ISKCON for short and thus began the Hare Krishna movement in America.
    </p>
    <p className="text-gray-700 leading-relaxed">
      At the time of incorporation, Srila Prabhupada had not attracted even one committed follower. Undeterred, he enlisted volunteers from among the small group of regular attendees at his evening lectures to act as ISKCON&apos;s first trustees. That was then. Today, ISKCON comprises of more than 400 temples worldwide, 40 rural communities and over 100 vegetarian restaurants. It also conducts special projects throughout the world, such as &ldquo;Food for Life&rdquo;, the only free vegetarian relief program in the world.
    </p>
  </div>
);

// const IskconGaurangadhamContent = () => (
//   <div className="space-y-6">
//     <h2 className="text-2xl font-semibold text-purple-800 mb-4">ISKCON Gaurranga Dham</h2>
//     <p className="text-gray-700 leading-relaxed">Content about ISKCON GaurangaDham temple will go here...</p>
//   </div>
// );

// const OurMissionContent = () => (
//   <div className="space-y-6">
//     <h2 className="text-2xl font-semibold text-purple-800 mb-4">Our Mission</h2>
//     <p className="text-gray-700 leading-relaxed">Content about ISKCON's mission will go here...</p>
//   </div>
// );

// const FounderAcharyaContent = () => (
//   <div className="space-y-6">
//     <h2 className="text-2xl font-semibold text-purple-800 mb-4">Founder Acharya</h2>
//     <p className="text-gray-700 leading-relaxed">Content about A.C. Bhaktivedanta Swami Prabhupada will go here...</p>
//   </div>
// );

// const OurBeliefsContent = () => (
//   <div className="space-y-6">
//     <h2 className="text-2xl font-semibold text-purple-800 mb-4">Our Beliefs</h2>
//     <p className="text-gray-700 leading-relaxed">Detailed content about ISKCON's beliefs will go here...</p>
//   </div>
// );

export default TemplePage;