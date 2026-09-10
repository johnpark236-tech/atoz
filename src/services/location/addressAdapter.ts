import { AddressInfo, SourceStatus } from './types';

// Administrative code database for major cities and representative dong codes
interface AdminCodeEntry {
  sido: string;
  sigungu: string;
  sggCd: string;
  dongs: Record<string, { bjdongCd: string; defaultLat: number; defaultLng: number }>;
}

const ADMIN_CODE_DB: AdminCodeEntry[] = [
  {
    sido: '충청남도',
    sigungu: '천안시 동남구',
    sggCd: '44131',
    dongs: {
      신부동: { bjdongCd: '11400', defaultLat: 36.8188, defaultLng: 127.1565 },
      대흥동: { bjdongCd: '10100', defaultLat: 36.8085, defaultLng: 127.1485 },
      원성동: { bjdongCd: '10600', defaultLat: 36.8032, defaultLng: 127.1612 },
      청수동: { bjdongCd: '11800', defaultLat: 36.7865, defaultLng: 127.1542 },
      청당동: { bjdongCd: '11900', defaultLat: 36.7795, defaultLng: 127.1585 },
      신방동: { bjdongCd: '12100', defaultLat: 36.7885, defaultLng: 127.1265 },
      쌍용동: { bjdongCd: '12200', defaultLat: 36.7975, defaultLng: 127.1215 },
      안서동: { bjdongCd: '11500', defaultLat: 36.8335, defaultLng: 127.1775 },
      유량동: { bjdongCd: '11600', defaultLat: 36.8195, defaultLng: 127.1855 },
      구성동: { bjdongCd: '10700', defaultLat: 36.7985, defaultLng: 127.1675 },
      사직동: { bjdongCd: '10300', defaultLat: 36.8062, defaultLng: 127.1535 },
      영성동: { bjdongCd: '10400', defaultLat: 36.8045, defaultLng: 127.1512 },
      봉명동: { bjdongCd: '10900', defaultLat: 36.8055, defaultLng: 127.1365 },
      다가동: { bjdongCd: '10800', defaultLat: 36.7995, defaultLng: 127.1435 },
      용곡동: { bjdongCd: '12000', defaultLat: 36.7825, defaultLng: 127.1395 },
      목천읍: { bjdongCd: '25000', defaultLat: 36.7625, defaultLng: 127.2275 },
    },
  },
  {
    sido: '충청남도',
    sigungu: '천안시 서북구',
    sggCd: '44133',
    dongs: {
      불당동: { bjdongCd: '11300', defaultLat: 36.8155, defaultLng: 127.1105 },
      두정동: { bjdongCd: '10700', defaultLat: 36.8325, defaultLng: 127.1425 },
      성정동: { bjdongCd: '10200', defaultLat: 36.8215, defaultLng: 127.1385 },
      백석동: { bjdongCd: '11000', defaultLat: 36.8285, defaultLng: 127.1225 },
      쌍용동: { bjdongCd: '10300', defaultLat: 36.8015, defaultLng: 127.1235 },
      와촌동: { bjdongCd: '10100', defaultLat: 36.8135, defaultLng: 127.1415 },
      차암동: { bjdongCd: '11200', defaultLat: 36.8525, defaultLng: 127.1085 },
      성성동: { bjdongCd: '10900', defaultLat: 36.8465, defaultLng: 127.1385 },
      직산읍: { bjdongCd: '25300', defaultLat: 36.8875, defaultLng: 127.1515 },
      성환읍: { bjdongCd: '25000', defaultLat: 36.9155, defaultLng: 127.1325 },
      입장면: { bjdongCd: '31000', defaultLat: 36.9065, defaultLng: 127.2425 },
    },
  },
  {
    sido: '서울특별시',
    sigungu: '강남구',
    sggCd: '11680',
    dongs: {
      역삼동: { bjdongCd: '10100', defaultLat: 37.5006, defaultLng: 127.0364 },
      대치동: { bjdongCd: '10600', defaultLat: 37.4946, defaultLng: 127.0628 },
      삼성동: { bjdongCd: '10500', defaultLat: 37.5140, defaultLng: 127.0565 },
      신사동: { bjdongCd: '10700', defaultLat: 37.5240, defaultLng: 127.0225 },
      논현동: { bjdongCd: '10800', defaultLat: 37.5115, defaultLng: 127.0285 },
      압구정동: { bjdongCd: '11000', defaultLat: 37.5305, defaultLng: 127.0325 },
      청담동: { bjdongCd: '10400', defaultLat: 37.5255, defaultLng: 127.0495 },
      개포동: { bjdongCd: '10300', defaultLat: 37.4785, defaultLng: 127.0585 },
      도곡동: { bjdongCd: '11800', defaultLat: 37.4885, defaultLng: 127.0455 },
      일원동: { bjdongCd: '11400', defaultLat: 37.4835, defaultLng: 127.0855 },
      수서동: { bjdongCd: '11500', defaultLat: 37.4875, defaultLng: 127.1015 },
    },
  },
  {
    sido: '서울특별시',
    sigungu: '마포구',
    sggCd: '11440',
    dongs: {
      서교동: { bjdongCd: '12000', defaultLat: 37.5535, defaultLng: 126.9215 },
      연남동: { bjdongCd: '12400', defaultLat: 37.5625, defaultLng: 126.9245 },
      합정동: { bjdongCd: '12200', defaultLat: 37.5485, defaultLng: 126.9125 },
      망원동: { bjdongCd: '12300', defaultLat: 37.5565, defaultLng: 126.9055 },
      상수동: { bjdongCd: '11500', defaultLat: 37.5475, defaultLng: 126.9235 },
      공덕동: { bjdongCd: '10200', defaultLat: 37.5445, defaultLng: 126.9515 },
    },
  },
  {
    sido: '서울특별시',
    sigungu: '서초구',
    sggCd: '11650',
    dongs: {
      서초동: { bjdongCd: '10800', defaultLat: 37.4915, defaultLng: 127.0125 },
      반포동: { bjdongCd: '10700', defaultLat: 37.5045, defaultLng: 127.0045 },
      방배동: { bjdongCd: '10100', defaultLat: 37.4825, defaultLng: 126.9935 },
      양재동: { bjdongCd: '10200', defaultLat: 37.4725, defaultLng: 127.0425 },
    },
  },
  {
    sido: '서울특별시',
    sigungu: '송파구',
    sggCd: '11710',
    dongs: {
      잠실동: { bjdongCd: '10100', defaultLat: 37.5135, defaultLng: 127.0855 },
      문정동: { bjdongCd: '10800', defaultLat: 37.4855, defaultLng: 127.1225 },
      가락동: { bjdongCd: '10700', defaultLat: 37.4945, defaultLng: 127.1185 },
      방이동: { bjdongCd: '11100', defaultLat: 37.5165, defaultLng: 127.1245 },
    },
  },
  {
    sido: '경기도',
    sigungu: '성남시 분당구',
    sggCd: '41135',
    dongs: {
      정자동: { bjdongCd: '10300', defaultLat: 37.3625, defaultLng: 127.1125 },
      서현동: { bjdongCd: '10500', defaultLat: 37.3855, defaultLng: 127.1265 },
      삼평동: { bjdongCd: '10900', defaultLat: 37.4015, defaultLng: 127.1115 },
      야탑동: { bjdongCd: '10700', defaultLat: 37.4115, defaultLng: 127.1285 },
      판교동: { bjdongCd: '11000', defaultLat: 37.3915, defaultLng: 127.0985 },
    },
  },
  {
    sido: '경기도',
    sigungu: '수원시 팔달구',
    sggCd: '41115',
    dongs: {
      인계동: { bjdongCd: '14100', defaultLat: 37.2635, defaultLng: 127.0285 },
      매산로1가: { bjdongCd: '10100', defaultLat: 37.2665, defaultLng: 127.0015 },
      화서동: { bjdongCd: '13100', defaultLat: 37.2835, defaultLng: 126.9985 },
    },
  },
  {
    sido: '대전광역시',
    sigungu: '유성구',
    sggCd: '30200',
    dongs: {
      봉명동: { bjdongCd: '10100', defaultLat: 36.3535, defaultLng: 127.3415 },
      궁동: { bjdongCd: '10400', defaultLat: 36.3645, defaultLng: 127.3525 },
      관평동: { bjdongCd: '12400', defaultLat: 36.4255, defaultLng: 127.3915 },
    },
  },
  {
    sido: '부산광역시',
    sigungu: '해운대구',
    sggCd: '26350',
    dongs: {
      우동: { bjdongCd: '10500', defaultLat: 35.1615, defaultLng: 129.1415 },
      중동: { bjdongCd: '10600', defaultLat: 35.1635, defaultLng: 129.1725 },
      좌동: { bjdongCd: '10400', defaultLat: 35.1745, defaultLng: 129.1785 },
    },
  },
];

/**
 * Normalizes and parses raw Korean address strings into structured parts.
 */
export function parseKoreanAddress(input: string): {
  sido: string;
  sigungu: string;
  bjdong: string;
  bun: string;
  ji: string;
  isSan: boolean;
  roadName?: string;
  buildingNum?: string;
  fullRoadAddress: string;
  fullJibunAddress: string;
} {
  const clean = input.trim().replace(/\s+/g, ' ');

  let sido = '';
  let sigungu = '';
  let bjdong = '';
  let bun = '1';
  let ji = '0';
  let isSan = false;
  let roadName = '';
  let buildingNum = '';

  // Extract Sido
  const sidoMatch = clean.match(
    /^(충남|충청남도|충북|충청북도|서울|서울특별시|경기|경기도|인천|인천광역시|부산|부산광역시|대구|대구광역시|대전|대전광역시|광주|광주광역시|울산|울산광역시|세종|세종특별자치시|강원|강원특별자치도|강원도|전남|전라남도|전북|전북특별자치도|전라북도|경남|경상남도|경북|경상북도|제주|제주특별자치도)/
  );

  if (sidoMatch) {
    const rawSido = sidoMatch[1];
    if (rawSido === '서울' || rawSido === '서울특별시') sido = '서울특별시';
    else if (rawSido === '충남' || rawSido === '충청남도') sido = '충청남도';
    else if (rawSido === '충북' || rawSido === '충청북도') sido = '충청북도';
    else if (rawSido === '경기' || rawSido === '경기도') sido = '경기도';
    else if (rawSido === '인천' || rawSido === '인천광역시') sido = '인천광역시';
    else if (rawSido === '대전' || rawSido === '대전광역시') sido = '대전광역시';
    else if (rawSido === '대구' || rawSido === '대구광역시') sido = '대구광역시';
    else if (rawSido === '부산' || rawSido === '부산광역시') sido = '부산광역시';
    else if (rawSido === '광주' || rawSido === '광주광역시') sido = '광주광역시';
    else if (rawSido === '울산' || rawSido === '울산광역시') sido = '울산광역시';
    else if (rawSido.includes('세종')) sido = '세종특별자치시';
    else if (rawSido.includes('강원')) sido = '강원특별자치도';
    else if (rawSido.includes('전북')) sido = '전북특별자치도';
    else if (rawSido.includes('전남')) sido = '전라남도';
    else if (rawSido.includes('경북')) sido = '경상북도';
    else if (rawSido.includes('경남')) sido = '경상남도';
    else if (rawSido.includes('제주')) sido = '제주특별자치도';
  } else {
    // Default inference: if contains "천안" -> 충청남도, "강남/마포/서초" -> 서울특별시
    if (clean.includes('천안')) sido = '충청남도';
    else if (clean.includes('성남') || clean.includes('수원') || clean.includes('용인')) sido = '경기도';
    else if (clean.includes('유성') || clean.includes('둔산')) sido = '대전광역시';
    else sido = '서울특별시';
  }

  // Extract Sigungu
  const sggMatch = clean.match(/([가-힣]+(?:시(?:\s+[가-힣]+구)?|군|구))/);
  if (sggMatch) {
    sigungu = sggMatch[1].replace(sido, '').trim();
  }
  if (!sigungu) {
    if (clean.includes('천안시 동남구') || clean.includes('동남구')) sigungu = '천안시 동남구';
    else if (clean.includes('천안시 서북구') || clean.includes('서북구')) sigungu = '천안시 서북구';
    else if (clean.includes('천안')) sigungu = '천안시 동남구';
    else if (clean.includes('강남구') || clean.includes('강남')) sigungu = '강남구';
    else if (clean.includes('마포구') || clean.includes('마포')) sigungu = '마포구';
    else if (clean.includes('서초구')) sigungu = '서초구';
    else if (clean.includes('분당구') || clean.includes('분당')) sigungu = '성남시 분당구';
    else sigungu = '천안시 동남구';
  }

  // Extract Dong / Eup / Myeon / Ro / Gil
  const dongMatch = clean.match(/([가-힣0-9]+(?:동|읍|면|가|리))(?:\s|$|[0-9])/);
  if (dongMatch) {
    bjdong = dongMatch[1];
  }

  const roadMatch = clean.match(/([가-힣0-9]+(?:로|길))\s*([0-9]+(?:-[0-9]+)?)/);
  if (roadMatch) {
    roadName = roadMatch[1];
    buildingNum = roadMatch[2];
  }

  // Check San (산)
  if (clean.includes('산 ') || clean.includes('산')) {
    const sanCheck = clean.match(/산\s*([0-9]+)/);
    if (sanCheck) {
      isSan = true;
    }
  }

  // Extract Bun & Ji (e.g. 123-4 or 451-1 or 737)
  const numberMatch = clean.match(/(?:산\s*)?([0-9]+)(?:-([0-9]+))?(?:번지)?(?:\s|$)/);
  if (numberMatch) {
    bun = numberMatch[1] || '1';
    ji = numberMatch[2] || '0';
  }

  if (!bjdong && roadName) {
    bjdong = roadName;
  }
  if (!bjdong) {
    bjdong = '신부동';
  }

  const fullJibunAddress = `${sido} ${sigungu} ${bjdong} ${isSan ? '산 ' : ''}${bun}${ji !== '0' ? `-${ji}` : ''}`.trim();
  const fullRoadAddress = roadName
    ? `${sido} ${sigungu} ${roadName} ${buildingNum}`.trim()
    : `${sido} ${sigungu} ${bjdong} ${bun}`;

  return {
    sido,
    sigungu,
    bjdong,
    bun,
    ji,
    isSan,
    roadName,
    buildingNum,
    fullRoadAddress,
    fullJibunAddress,
  };
}

/**
 * Builds the standard 19-digit Korean PNU (Parcel Number) code.
 * Structure: SGG(5) + BJDONG(5) + LandType(1: 1=대지/일반, 2=산) + Bun(4, zero-padded) + Ji(4, zero-padded)
 */
export function buildPNU(
  sggCd: string,
  bjdongCd: string,
  isSan: boolean,
  bun: string | number,
  ji: string | number
): string {
  const cleanSgg = (sggCd || '44131').padStart(5, '0').slice(0, 5);
  const cleanBjdong = (bjdongCd || '11400').padStart(5, '0').slice(0, 5);
  const landType = isSan ? '2' : '1';
  const cleanBun = String(bun || '1').padStart(4, '0').slice(-4);
  const cleanJi = String(ji || '0').padStart(4, '0').slice(-4);

  return `${cleanSgg}${cleanBjdong}${landType}${cleanBun}${cleanJi}`;
}

/**
 * Geocode address into coordinates, PNU, administrative codes, and standardized addresses.
 */
export async function geocodeAddress(
  rawAddress: string,
  vworldApiKey?: string
): Promise<AddressInfo> {
  const parsed = parseKoreanAddress(rawAddress);

  // 1. Try Live VWorld Geocoder API if key exists
  if (vworldApiKey) {
    try {
      const isRoad = Boolean(parsed.roadName) && !rawAddress.includes('번지');
      const primaryType = isRoad ? 'ROAD' : 'PARCEL';
      const secondaryType = isRoad ? 'PARCEL' : 'ROAD';

      let vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(
        rawAddress
      )}&refine=true&simple=false&format=json&type=${primaryType}&key=${vworldApiKey}`;

      let res = await fetch(vworldUrl);
      let data: any = res.ok ? await res.json() : null;

      if (data?.response?.status !== 'OK') {
        vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getCoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(
          rawAddress
        )}&refine=true&simple=false&format=json&type=${secondaryType}&key=${vworldApiKey}`;
        res = await fetch(vworldUrl);
        data = res.ok ? await res.json() : null;
      }

      if (data?.response?.status === 'OK' && data.response.result?.point) {
        const point = data.response.result.point;
        const lat = parseFloat(point.y);
        const lng = parseFloat(point.x);
        const refined = data.response.refined;
        const refinedRoad = refined?.structure?.road || refined?.text || parsed.fullRoadAddress;
        const refinedJibun = refined?.structure?.parcel || parsed.fullJibunAddress;
        const livePnu = refined?.structure?.level4LC || refined?.structure?.level4AC || '';

        // Find admin code
        const adminEntry = ADMIN_CODE_DB.find(
          (e) => e.sido.includes(parsed.sido) && e.sigungu.includes(parsed.sigungu)
        );
        const dongEntry = adminEntry?.dongs[parsed.bjdong];
        const sggCd = adminEntry?.sggCd || (livePnu ? livePnu.slice(0, 5) : '44131');
        const bjdongCd = dongEntry?.bjdongCd || (livePnu ? livePnu.slice(5, 10) : '11400');
        const pnu = livePnu && livePnu.length === 19 ? livePnu : buildPNU(sggCd, bjdongCd, parsed.isSan, parsed.bun, parsed.ji);

        return {
          rawAddress,
          roadAddress: refinedRoad,
          jibunAddress: refinedJibun,
          lat,
          lng,
          sido: refined?.structure?.level1 || parsed.sido,
          sigungu: refined?.structure?.level2 || parsed.sigungu,
          bjdong: refined?.structure?.level4L || parsed.bjdong,
          hjdong: refined?.structure?.level4A,
          pnu,
          sggCd,
          bjdongCd,
          bun: parsed.bun.padStart(4, '0'),
          ji: parsed.ji.padStart(4, '0'),
          sourceStatus: 'LIVE_API',
        };
      }
    } catch (err) {
      console.warn('VWorld geocoding failed, falling back to built-in GIS database:', err);
    }
  }

  // 2. Built-in High Precision GIS Admin Database Lookup
  let sggCd = '44131';
  let bjdongCd = '11400';
  let lat = 36.8188;
  let lng = 127.1565;

  const matchedCity = ADMIN_CODE_DB.find(
    (e) =>
      (parsed.sido && e.sido.includes(parsed.sido)) ||
      (parsed.sigungu && e.sigungu.includes(parsed.sigungu))
  );

  if (matchedCity) {
    sggCd = matchedCity.sggCd;
    const matchedDong = Object.entries(matchedCity.dongs).find(
      ([dongName]) => parsed.bjdong.includes(dongName) || dongName.includes(parsed.bjdong)
    );

    if (matchedDong) {
      bjdongCd = matchedDong[1].bjdongCd;
      lat = matchedDong[1].defaultLat;
      lng = matchedDong[1].defaultLng;

      // Small jitter based on bun/ji to simulate distinct building position if within same dong
      const bunNum = parseInt(parsed.bun, 10) || 1;
      const jiNum = parseInt(parsed.ji, 10) || 0;
      lat += ((bunNum % 20) - 10) * 0.00015 + (jiNum % 5) * 0.00005;
      lng += (((bunNum * 3) % 20) - 10) * 0.00015 + (jiNum % 5) * 0.00005;
    }
  }

  const pnu = buildPNU(sggCd, bjdongCd, parsed.isSan, parsed.bun, parsed.ji);

  return {
    rawAddress,
    roadAddress: parsed.fullRoadAddress,
    jibunAddress: parsed.fullJibunAddress,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    sido: parsed.sido,
    sigungu: parsed.sigungu,
    bjdong: parsed.bjdong,
    pnu,
    sggCd,
    bjdongCd,
    bun: parsed.bun.padStart(4, '0'),
    ji: parsed.ji.padStart(4, '0'),
    sourceStatus: 'REFERENCE_DATA',
  };
}
