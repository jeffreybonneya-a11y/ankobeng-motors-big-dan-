import { Product, BusinessInfo, ServiceItem } from '../types/inventory';

export const BUSINESS_INFO: BusinessInfo = {
  name: 'ANKOBENG MOTORS',
  subTitle: 'BIG DAN • ABOSSEY OKAI',
  tagline: 'DEALERS IN OPEL ENGINES & ALL KINDS OF ENGINE PARTS',
  ownerNickname: 'Big Dan',
  phones: {
    primary: '0244148534',
    secondary: '0277649509',
    formatted: '0244148534 / 0277649509'
  },
  address: {
    poBox: 'Box KN4009, ACCRA',
    area: 'Abossey Okai',
    city: 'Accra',
    country: 'Ghana',
    landmark: 'Near the Post Office, Abossey Okai – Accra',
    gps: '5.547731, -0.217733',
    mapsLink: 'https://www.bing.com/maps?q=Box+KN4009%2C+ACCRA%2C+location%3B+Near+the+Post+Office+Abossey+Okai-+Accra'
  },
  workingHours: {
    regular: 'Mon - Sat: 7:30 AM – 6:00 PM',
    sunday: 'Sunday: Emergency Orders Only'
  }
};

export const ASSETS = {
  storefront: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8X6C86WfEu2uxhm4sfSG-cFaDBG1IZdBlxHtaAfd9LKGg6RZdTp5Rq_RZ2w4UzU0_HgGochsxkODL1CUMbZ5OBoFae8Dz0Hqr_Tpl02H7P_VSotnd5RkIcIGj-Jb1I2ui3W5ZMcAdxLbs_vIqrUt4WgC8CNLKMca54WONTdGkFQ0WCb4x8tWhOQwE9PpKhXWW0ARz0oBHkzZRqs-mwr3ZnJyloGhiTvvbRbWbHyCOxkg8OoPCggZ9u0FDo0D8aP0PgQ',
  mapReference: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJLlWIadVOiLBYvcnLyyUoohzhfnAWiaTc16jV5JV8GF0dGc5fiwP8MOd0ibt2T66tOtlMc6syrMx7hAMyOlCXRRUZoYexbWLooKvAvH2DIxJt7SG8n_dj7Yav9AG_g4sMagsJBquKJPcjz_UwQFKh2gEtJUoRtLEjmzAWuat68jBIbY1M3Q9vCMAE1gfnDv_Y3B2P5QOEni1dmrkuXU72Z4qabQExJVtf1k34iGJIN0p4YWXV4wzOaPEkdP8YB0E5yvU'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-opel-14',
    name: 'OPEL 1.4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBeZvw8L6lNOAN3kQQig1nBhH-jCANIq24tXiy6f2wDruCTuBWt_zba-wQ7p3AhuvLd9ICiniQrHEBk_mk_eRr9NJ1XDftj7rjuMhJWichaAv4uIksd_bHwae3o7_x9--jFzzw1vPT0yY2-tqaMVKqBTKUkY0mE2y8syZthqHaHFfG0hKITQis8vrbEGZGeN4tJyIYzdB83RxojbstV2s2YtzGBwZO7LIBjhTZHr1Hg82KhZGS9XJPlwy45d-ZOJJi3iw',
    category: 'OPEL',
    description: 'Genuine Opel 1.4 petrol engine assembly. Complete block with intake setup ready for inspection at Abossey Okai yard.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-opel-diesel-17',
    name: 'OPEL DIESEL 1.7',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OxebKXgng7p0oCNjk0dnQ8bGJxAXelsDHG1lmy_PqAgUTaxMySeeHtYDZxYHAJGQdeecaZx40BfUtANeI0tQdOdJjNj-cwpep6UctP2JbkSNqcSTBkNASqtGPTc4PcDKHFgaqye_XtaPhS__2w6iqUOOqz1I6e_9nzExrocPFlO1EEcJy5dRjcW8kYGiafHmA1tQRe_clDT7W1xrLPixcneilampOQKjEGg9V0e9atCEEyI_6HuIjiBargl6_5baSKo',
    category: 'OPEL',
    description: 'European imported Opel 1.7 Diesel powertrain. Heavy-duty industrial reliability with intact factory fittings.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-nissan-20',
    name: 'NISSAN 2.0',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA6GYI96vKND6a_4JVx_M0wtIMGPjq2wN3VeUPV3DlLd6hpjq9NEyvWXSyooPfsfA_1c70m_-dJSLd9l4PPim_kTXYT-AxfVgXhKFSdXPZAej8NHAkMrGw2y4UqA3meKBNIUaxiRxyHgN9fACslQleGsBbHqnDCg5r9qgo87jCMfjUHeL56Tkn887ltf1hPYoVCVxFgqXs_EiHqWpT4okCQ3arOpRMCqdy0mqXPgr6lnRUUCAtE2Ud4prLAGvKYEne5NI',
    category: 'OTHER',
    description: 'Nissan 2.0 Twin Cam 16-Valve engine assembly. Original intake, verified timing housing, clean yard unit.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-chevrolet-cruz',
    name: 'CHEVROLET CRUZ 1.8, 1.4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVVfc0uIPV57VnYGkRY9MGsefmcvpg-2EK-kvNpjYAVtW99eq_S_jVwwVXa4_objbb5ek9YzHVkowv5sc02UMA6Rga2ywAhjuqTUgm9YzH32iGUOQuX4_fu18Ul3_eVgHUseT7FucVzUnki8qBBK6lSc6KBBsARq8At6xKZB9Sxo4cX-j-eXyVWktQPTkuqNOKhzqoSYJjVLjfoKUqpu9RlH36AY0f7Ug-xjFc9H_NDSK8ibWSluR3S4g7CmRNzqstPYU',
    category: 'CHEVROLET',
    description: 'Chevrolet Cruz S-TEC 16V engine assembly with original pulleys and alternator bracket intact.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-chevrolet-aveo',
    name: 'CHEVROLET AVEO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5FxDP7YkCQOVA_H1eDqciPZHD-VSWXhZQEUZYRTq1edWWpSURLNmHJm8DqYFt9tdfJdcIbVUV-Uj2inLstw9ZNDacm8sRKd17EhPKRb3v8sPn026wrebeTEpF4ZA73ETcKlExcESUrKwO-6BPPQzvcgw846nCLICb0gc9BfaG5ca2MroulKlDlzRFzUlWM1Oh_Kx5_JZcXpk4octIac4PRmL-oF_Bh2-_P15tj_VCmZTnN_LXD4UGdkWbmQf6IYg4FJA',
    category: 'CHEVROLET',
    description: 'Chevrolet Aveo E-TEC II 16V complete engine. Clean top cover, factory seals, ready for mechanic inspection.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-hyundai-atos',
    name: 'HYUNDAI ATOS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9q3iXLoD_XjXdEnItcJpA5fC0Xzneh_qlwPZREn4FYdbQ07qxC3uotV_GD3t2lFt9AebTm8t_6EG3Prw_f3tT7gZHv1Vr97JFmDXYHoClJ1Kkhx_4IsKhr0PrXpFziF_G9EWGF5vHRKbwuljcoNA6GIvhOkYx2f-8IMX3-lN7hQW2LmelMSO85WvPyaITye6a0Jl0zJynEb_fHix2kClocJZAEISBTLvEGBphCEqY43qnZ8fNqZQtkw0pS4LqC2_6h7M',
    category: 'OTHER',
    description: 'Hyundai Atos compact motor assembly. Fully preserved front-drive belt components and clean engine block.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-picanto',
    name: 'PICANTO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-pYUpgOiZiUS3qYmxUWokMdZjX6MOxhpt5mS8ASLXI56h5wgxPB56xXI18W0Yz6SRtLn6zhFznVIKERvhRvbjdMWIosh4yHL0QXy1psJwFWrsyQZCSBLDnHxrA2MHvb3K2RREe250ycwnBfqTjqhJHy9uT9Hjm8q6Ntvu46MzZZBUyo7o_M_tJWCizZAeLKs544QexDnXMGk7OI4f63xpDeDvN_IcpLuOSDKidSPQ-4ZjuqgxFQpSThgqCDcAgoixKh8',
    category: 'OTHER',
    description: 'Kia Picanto European replacement engine. Low-mileage imported block with transmission coupling flange.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-matiz-3-4plugs',
    name: 'MATIZ 3(4 PLUGS)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs4pVQcbQt5C48_opnelwfTij87flrbo3w9g7or2Sun2CFPpomQCs21jp6mO7NTN8J3pRBKJSpf5rnKCRNHNQxSi4eiJGHuCTSqXg2PdeAE_L-FeavtU_gmRjZEKH1DJ7MyQVGHt6XKkunuLGDc1zzpL_dEYXBrypJoCeTHCYyOi-Ertq1E7uaarynuZ5A1MMOx2e0k0I6uqU0RjmpeoXKPcWl00EcJgq3cv-_Q8k0ANDePyilDiQE_boi0Hg7S5eXX-I',
    category: 'OTHER',
    description: 'Matiz 3 (4 Plugs) E-TEC II engine assembly. Authentic imported block with manifolds intact.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-matiz-3-3plugs',
    name: 'MATIZ 3(3 PLUGS)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx_S6AsTppQov2l9nODp5qKM3-sKumagTQuB0Ex5CxXDMoZNwGXEmvMyU6JT1mxF4pzCHa1byrdh8sBNJeXZS1AIGmq-PMyNMax7WPyUCLsLHKTDEHV_AYGnOfI2olOELukBBQ0CUayD6uUI8zhYidn9UC51duTxC0tAoHnedmHXRBSfHI7QBZktG05BE5jqVDCQa_3AY1futXUbWWQCXlb0XkHgY0j8YB1vHJGMVgRoOjJ38u_JJ_Vfc_oR1A-rKfgfQ',
    category: 'OTHER',
    description: 'Matiz 3 (3 Plugs) original 3-cylinder engine. Complete compact motor ready for drop-in replacement.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  },
  {
    id: 'prod-daewao-tacuma',
    name: 'DAEWAO TACUMA',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApPG3mTuayQE3eA6fnch2EMIJ7ex50Yqy2aV56gDyc8LQj_h3YuSjXODseg6A5gEuVFC83yZcRuTCjC-KBYzbL6vRfoGcMVcs7BTEDYJdDSdknE2lIp44b1ay2X4D5fnR5NqUI7uV-q6H3VB0MAJo609Oh_WsclTr-L9Hlf5MNZG7H-qLASFVMk2NJG-pVfExGA2yrpLrTAcy5sMWa-wgxkJIzdXLkYxfscrBKZ62BZgkEKcGc_W6L89ewqbfFkwm0VeE',
    category: 'OTHER',
    description: 'Daewoo Tacuma 2.0 multi-valve motor assembly. Robust imported European yard inventory.',
    featured: true,
    yardLocation: 'Abossey Okai Main Yard'
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'srv-opel-engines',
    title: 'OPEL ENGINES (PETROL & DIESEL)',
    description: 'Direct European imports of authentic Opel 1.4, 1.6, 1.7 Diesel, 1.8, and 2.0 complete engines for Astra, Corsa, Vectra, and Zafira.',
    iconName: 'Engine'
  },
  {
    id: 'srv-transmissions',
    title: 'MANUAL & AUTOMATIC GEARBOXES',
    description: 'Inspected transmission assemblies with original clutches, bellhousings, and linkage mounts matching factory specs.',
    iconName: 'Cog'
  },
  {
    id: 'srv-cylinder-heads',
    title: 'CYLINDER HEADS & CRANKSHAFTS',
    description: 'Genuine OEM top-end cylinder heads, camshafts, and balanced crankshafts ready for mechanic measurement and drop-in rebuilds.',
    iconName: 'Wrench'
  },
  {
    id: 'srv-replacement-assemblies',
    title: 'MULTI-BRAND REPLACEMENT MOTORS',
    description: 'Selected stock for Chevrolet Cruz/Aveo, Nissan 2.0, Hyundai Atos, Kia Picanto, and Daewoo Matiz/Tacuma.',
    iconName: 'Car'
  },
  {
    id: 'srv-yard-testing',
    title: 'PHYSICAL SHOP FLOOR INSPECTION',
    description: 'Mechanics and buyers are invited to inspect motor compression, turn crankshafts, and verify casting numbers at our Abossey Okai shop.',
    iconName: 'CheckCircle'
  },
  {
    id: 'srv-nationwide-dispatch',
    title: 'ACCRA & NATIONWIDE DISPATCH',
    description: 'Immediate loading at our roadside ramp in Abossey Okai or arranged transport delivery across Greater Accra, Kumasi, Takoradi, and beyond.',
    iconName: 'Truck'
  }
];
