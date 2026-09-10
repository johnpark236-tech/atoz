import { AddressInfo, BuildingInfo, BuildingPurposeClassification, SuitabilityLevel } from './types';

/**
 * Classifies building purpose and computes operational suitability for a given business type.
 */
export function classifyBuildingPurpose(
  mainPurpose: string,
  etcPurpose: string,
  selectedBusinessType: string = ''
): BuildingPurposeClassification {
  const combined = `${mainPurpose} ${etcPurpose}`.toLowerCase();
  const bus = selectedBusinessType.trim().toLowerCase();

  let category = '근린생활시설';
  let suitabilityLevel: SuitabilityLevel = 'HIGH';
  let suitabilitySummary = '';
  const recommendedChecks: string[] = [
    '관할 지자체(시·군·구청 건축과/위생과) 영업 인허가 가능 여부 사전 확인',
    '건축물대장상 위반건축물 표기(불법 증축, 무단 용도변경) 유무 확인',
  ];

  if (combined.includes('제2종근린생활시설') || combined.includes('2종근린')) {
    category = '제2종근린생활시설';
  } else if (combined.includes('제1종근린생활시설') || combined.includes('1종근린')) {
    category = '제1종근린생활시설';
  } else if (combined.includes('교육연구') || combined.includes('학원')) {
    category = '교육연구시설';
  } else if (combined.includes('업무시설') || combined.includes('오피스')) {
    category = '업무시설';
  } else if (combined.includes('판매시설') || combined.includes('상가') || combined.includes('백화점') || combined.includes('마트')) {
    category = '판매시설';
  } else if (combined.includes('공동주택') || combined.includes('아파트') || combined.includes('다세대') || combined.includes('연립')) {
    category = '공동주택 (주거시설)';
  } else if (combined.includes('단독주택') || combined.includes('다가구')) {
    category = '단독주택 (주거시설)';
  } else if (combined.includes('의료시설') || combined.includes('병원')) {
    category = '의료시설';
  } else if (combined.includes('숙박시설') || combined.includes('호텔') || combined.includes('모텔')) {
    category = '숙박시설';
  } else {
    category = mainPurpose || '기타 일반건축물';
  }

  // Business Type specific suitability logic
  if (bus.includes('카페') || bus.includes('휴게음식') || bus.includes('디저트') || bus.includes('베이커리')) {
    if (category.includes('근린생활시설') || category.includes('판매시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '휴게음식점/카페 영업신고가 가능한 근린생활시설 용도입니다.';
      recommendedChecks.push('상하수도 배관 인입 및 전기 용량(통상 15kW~25kW) 확인');
      recommendedChecks.push('배수설비 및 오수인입 여부 확인');
    } else if (category.includes('주거')) {
      suitabilityLevel = 'REQUIRES_PERMIT';
      suitabilitySummary = '주거용 시설로, 상가/휴게음식점으로 용도변경(근린생활시설) 인허가가 선행되어야 합니다.';
      recommendedChecks.push('지자체 건축과 용도변경 가능 여부 확인');
    } else {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '현재 용도에서 카페 운영 가능 여부(부속용도 또는 표시변경) 검토가 필요합니다.';
    }
  } else if (bus.includes('음식점') || bus.includes('식당') || bus.includes('주점') || bus.includes('요식')) {
    if (category.includes('제2종근린생활시설') || combined.includes('일반음식점')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '일반음식점 영업신고에 가장 적합한 제2종근린생활시설 용도입니다.';
      recommendedChecks.push('건축물 정화조 용량(인원수 기준) 및 하수도원인자부담금 부과 대상 확인');
      recommendedChecks.push('소방법상 다중이용업소 해당 여부(지하 66㎡, 지상 2층 이상 100㎡ 이상) 및 비상구 확인');
      recommendedChecks.push('주방 후드 및 닥트 옥상 배출 라인 설치 가능 여부');
    } else if (category.includes('제1종근린생활시설')) {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '제1종근생(휴게음식점 가능)이므로 일반음식점(주류 판매 등) 운영 시 제2종근생으로의 기재변경 신청이 필요할 수 있습니다.';
      recommendedChecks.push('정화조 용량 및 건축물 기재변경 신고 가능 여부');
    } else {
      suitabilityLevel = 'REQUIRES_PERMIT';
      suitabilitySummary = '현재 건축물 용도가 일반음식점 기준에 맞지 않아 용도변경 허가/신고가 필요합니다.';
    }
  } else if (bus.includes('학원') || bus.includes('교육') || bus.includes('교습소') || bus.includes('어린이')) {
    if (category.includes('교육연구시설') || combined.includes('학원') || category.includes('제2종근린생활시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '학원/교습소 설립 인가 기준에 부합하는 용도입니다.';
      recommendedChecks.push('관할 교육청 학원 설립 조례 기준 충족 확인 (강의실 순수 바닥면적 기준)');
      recommendedChecks.push('건물 내 교육환경 유해요소(유흥업소, 단란주점 등) 입점 여부 확인 (교육환경보호에 관한 법률)');
      recommendedChecks.push('직통계단 2개소 확보 여부 (3층 이상 층에서 학원 전용면적 200㎡ 이상인 경우 필수)');
      recommendedChecks.push('소방안전시설 완비증명서 발급 대상 여부 확인');
    } else {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '학원 규모(면적)에 따라 제2종근생(500㎡ 미만) 또는 교육연구시설(500㎡ 이상)로의 용도 적합성 검토가 필요합니다.';
      recommendedChecks.push('교육청 인허가 기준 강의실 면적 및 교육환경 유해업소 배제 확인');
    }
  } else if (bus.includes('미용') || bus.includes('헤어') || bus.includes('네일') || bus.includes('뷰티') || bus.includes('피부')) {
    if (category.includes('근린생활시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '이·미용업 영업신고가 가능한 제1종/제2종 근린생활시설 용도입니다.';
      recommendedChecks.push('미용사 면허증 소지자 영업신고 가능 여부');
      recommendedChecks.push('샴푸대/세면대 상하수도 급배수 라인 설치 용이성');
    } else {
      suitabilityLevel = 'REQUIRES_PERMIT';
      suitabilitySummary = '공중위생관리법상 근린생활시설 용도 확보가 필요합니다.';
    }
  } else if (bus.includes('소매') || bus.includes('편의점') || bus.includes('의류') || bus.includes('무인') || bus.includes('문구')) {
    if (category.includes('근린생활시설') || category.includes('판매시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '소매점 및 무인판매점 운영에 적합한 근린생활시설/판매시설 용도입니다.';
      recommendedChecks.push('담배소매인 지정 거리제한(통상 50m~100m) 기존 점포 중복 확인 (편의점인 경우)');
      recommendedChecks.push('무인기기(키오스크) 전력 및 통신망 단말기 인입 확인');
    } else {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '소매점(제1종근생) 운영 가능 여부 확인이 필요합니다.';
    }
  } else if (bus.includes('헬스') || bus.includes('피트니스') || bus.includes('필라테스') || bus.includes('체육')) {
    if (category.includes('제2종근린생활시설') || category.includes('운동시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '체육시설(500㎡ 미만 제2종근생, 500㎡ 이상 운동시설) 운영 적합 용도입니다.';
      recommendedChecks.push('바닥 하중 및 층간 소음/진동 완충 시공 가능 여부');
      recommendedChecks.push('샤워실 설치 시 오수배관 및 정화조 용량 충족 여부');
    } else {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '체육시설의 설치·이용에 관한 법률상 체육도장/체력단련장 용도 확인 필요';
    }
  } else {
    if (category.includes('근린생활시설')) {
      suitabilityLevel = 'HIGH';
      suitabilitySummary = '다양한 일반 사업자 등록 및 영업 신고가 가능한 근린생활시설 용도입니다.';
    } else {
      suitabilityLevel = 'MEDIUM';
      suitabilitySummary = '건축물 주용도와 희망 업종 간의 인허가 적합성을 관할 지자체에서 교차 확인하시기 바랍니다.';
    }
  }

  return {
    category,
    mainPurposeName: mainPurpose,
    etcPurposeName: etcPurpose,
    suitabilityLevel,
    suitabilitySummary,
    recommendedChecks,
  };
}

/**
 * Queries building register from Architecture HUB Open API or provides reference structural data.
 */
export async function getBuildingRegister(
  address: AddressInfo,
  businessType: string = '',
  serviceKey?: string
): Promise<BuildingInfo> {
  // Extract sigunguCd and bjdongCd directly from PNU if available
  const sggCd = address.pnu && address.pnu.length === 19 ? address.pnu.slice(0, 5) : address.sggCd;
  const bjdongCd = address.pnu && address.pnu.length === 19 ? address.pnu.slice(5, 10) : address.bjdongCd;
  const isSan = address.pnu.length >= 11 && address.pnu[10] === '2';
  const platGbCd = isSan ? '1' : '0';
  const bunPadded = address.bun.padStart(4, '0');
  const jiPadded = address.ji.padStart(4, '0');

  // 1. Live Public API Call if Service Key is provided
  if (serviceKey) {
    try {
      const cleanKey = serviceKey.trim();
      let url = `http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${encodeURIComponent(
        cleanKey
      )}&sigunguCd=${sggCd}&bjdongCd=${bjdongCd}&platGbCd=${platGbCd}&bun=${bunPadded}&ji=${jiPadded}&_type=json&numOfRows=10`;

      let res = await fetch(url);
      if (!res.ok) {
        url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${cleanKey}&sigunguCd=${sggCd}&bjdongCd=${bjdongCd}&platGbCd=${platGbCd}&bun=${bunPadded}&ji=${jiPadded}&_type=json&numOfRows=10`;
        res = await fetch(url);
      }

      if (res.ok) {
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          // Sometimes XML
        }

        const items = data?.response?.body?.items?.item;
        const item = Array.isArray(items) ? items[0] : (items && typeof items === 'object' && Object.keys(items).length > 0 ? items : null);

        if (item && item.mainPurpsCdNm) {
          const mainPurpose = item.mainPurpsCdNm || '제2종근린생활시설';
          const etcPurpose = item.etcPurps || item.etcPurpsNm || '';
          const buildingName = (item.bldNm && item.bldNm.trim()) ? item.bldNm.trim() : `${address.bjdong} 일반건축물`;
          const classification = classifyBuildingPurpose(mainPurpose, etcPurpose, businessType);

          const indrMech = parseInt(item.indrMechUtcnt || '0', 10);
          const indrAuto = parseInt(item.indrAutoUtcnt || '0', 10);
          const oudrMech = parseInt(item.oudrMechUtcnt || '0', 10);
          const oudrAuto = parseInt(item.oudrAutoUtcnt || '0', 10);
          const calcParking = indrMech + indrAuto + oudrMech + oudrAuto;
          const parkingCnt = item.totPkngCnt ? parseInt(item.totPkngCnt, 10) : (calcParking > 0 ? calcParking : null);

          return {
            buildingName,
            jibunAddress: item.platPlc || address.jibunAddress,
            roadAddress: item.newPlatPlc || address.roadAddress,
            mainPurpose,
            etcPurpose,
            structure: item.strctCdNm || item.etcStrct || '',
            platArea: item.platArea ? parseFloat(item.platArea) : null,
            archArea: item.archArea ? parseFloat(item.archArea) : null,
            totArea: item.totArea ? parseFloat(item.totArea) : null,
            bcRat: item.bcRat ? parseFloat(item.bcRat) : null,
            vlRat: item.vlRat ? parseFloat(item.vlRat) : null,
            grndFlrCnt: item.grndFlrCnt ? parseInt(item.grndFlrCnt, 10) : null,
            ugrndFlrCnt: item.ugrndFlrCnt ? parseInt(item.ugrndFlrCnt, 10) : null,
            rideUseElvtCnt: item.rideUseElvtCnt ? parseInt(item.rideUseElvtCnt, 10) : 0,
            parkingCnt,
            pmsDay: item.pmsDay || null,
            stcnsDay: item.stcnsDay || null,
            useAprDay: item.useAprDay || null,
            sourceStatus: 'LIVE_API',
            classification,
          };
        }
      }
    } catch (err) {
      console.warn('Building register API call failed:', err);
    }
  }

  // 2. Pure Non-Mock Fallback (Zero fake data)
  const defaultMainPurpose = '대장 미등재 / 필지';
  const defaultClassification = classifyBuildingPurpose(defaultMainPurpose, '', businessType);

  return {
    buildingName: '대장 미등재 건축물 / 필지',
    jibunAddress: address.jibunAddress,
    roadAddress: address.roadAddress,
    mainPurpose: defaultMainPurpose,
    etcPurpose: '',
    structure: '',
    platArea: null,
    archArea: null,
    totArea: null,
    bcRat: null,
    vlRat: null,
    grndFlrCnt: null,
    ugrndFlrCnt: null,
    rideUseElvtCnt: null,
    parkingCnt: null,
    pmsDay: null,
    stcnsDay: null,
    useAprDay: null,
    sourceStatus: serviceKey ? 'NOT_FOUND' : 'API_KEY_REQUIRED',
    classification: defaultClassification,
  };
}
