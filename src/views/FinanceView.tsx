import React, { useState } from 'react';
import { Project, SaleRecord } from '../types';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  X,
} from 'lucide-react';

interface FinanceViewProps {
  project: Project;
  onAddSale: (sale: SaleRecord) => void;
  onUpdateSaleStatus: (saleId: string, status: SaleRecord['status']) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  project,
  onAddSale,
  onUpdateSaleStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Sale Form
  const [channel, setChannel] = useState('네이버 스마트스토어');
  const [productName, setProductName] = useState('훈민정음 한글 원목 주사위 세트');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(38000);
  const [manufacturingCost, setManufacturingCost] = useState(12000);
  const [shippingCost, setShippingCost] = useState(3000);
  const [adCost, setAdCost] = useState(5000);

  // Interactive Margin Calculator state
  const [calcPrice, setCalcPrice] = useState(38000);
  const [calcCost, setCalcCost] = useState(12000);
  const [calcShip, setCalcShip] = useState(3000);
  const [calcAd, setCalcAd] = useState(4000);
  const [calcFeePercent, setCalcFeePercent] = useState(3.8); // 3.8% 스마트스토어 평균

  const calcFee = Math.round(calcPrice * (calcFeePercent / 100));
  const calcVat = Math.round(calcPrice / 11);
  const calcNet = calcPrice - calcCost - calcShip - calcAd - calcFee;
  const calcMargin = calcPrice > 0 ? Math.round((calcNet / calcPrice) * 100) : 0;

  // Aggregate stats
  const totalRevenue = project.sales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalFee = project.sales.reduce((acc, s) => acc + s.platformFee, 0);
  const totalCost = project.sales.reduce(
    (acc, s) => acc + s.manufacturingCost + s.shippingCost + s.adCost,
    0
  );
  const totalSettlementPending = project.sales
    .filter((s) => s.status !== '입금완료')
    .reduce((acc, s) => acc + s.settlementExpectedAmount, 0);
  const totalSettled = project.sales
    .filter((s) => s.status === '입금완료')
    .reduce((acc, s) => acc + (s.actualDepositAmount || s.settlementExpectedAmount), 0);
  const totalProfit = project.sales.reduce((acc, s) => acc + s.netProfit, 0);

  // Estimated 10% VAT liability to reserve
  const estimatedVatToReserve = Math.round(totalRevenue / 11);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const totalRev = unitPrice * quantity;
    // Platform fee approximation
    const feeRate = channel.includes('쿠팡') ? 0.11 : channel.includes('스마트스토어') ? 0.038 : 0.033;
    const fee = Math.round(totalRev * feeRate);
    const expectedAmount = totalRev - fee - shippingCost;
    const net = totalRev - fee - shippingCost - manufacturingCost * quantity - adCost;

    const newSale: SaleRecord = {
      id: `SALE-${Date.now()}`,
      orderDate: new Date().toISOString().split('T')[0],
      channel,
      productName,
      quantity,
      unitPrice,
      totalRevenue: totalRev,
      platformFee: fee,
      shippingCost,
      manufacturingCost: manufacturingCost * quantity,
      adCost,
      settlementExpectedAmount: expectedAmount,
      settlementExpectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      netProfit: net,
      status: '배송중',
    };

    onAddSale(newSale);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Core principle - "통장 입금된 돈이 전부 내 돈이 아니다" */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-[28px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-amber-200/80 text-amber-900 rounded-2xl mt-0.5 shrink-0 font-black">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-amber-950 tracking-tight">
              창업 1년차 핵심 수칙: &ldquo;매출 입금액이 전부 내 수익이 아닙니다!&rdquo;
            </h3>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed font-medium">
              정산금 중 <strong>부가가치세 10% (약 {estimatedVatToReserve.toLocaleString('ko-KR')}원)</strong>는 국세청에 납부할 세금입니다. 세금 전용 파킹통장에 즉시 이체해 두셔야 1월/7월 부가세 폭탄을 방지할 수 있습니다.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-black hover:bg-slate-800 transition-all shrink-0 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-blue-400" />
          <span>새 주문/정산 등록</span>
        </button>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            총 판매 매출액 (결제금액)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ₩{totalRevenue.toLocaleString('ko-KR')}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            주문 {project.sales.length}건 합계
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
            내 통장 실입금액 (정산완료)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
            ₩{totalSettled.toLocaleString('ko-KR')}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            플랫폼 수수료 공제 후 실입금
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">
            정산 예정액 (미입금 대기)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">
            ₩{totalSettlementPending.toLocaleString('ko-KR')}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            구매확정 및 정산 주기 대기중
          </p>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">
            실제 순이익 (최종 마진)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
            ₩{totalProfit.toLocaleString('ko-KR')}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            제조원가, 택배비, 광고비 차감 후
          </p>
        </div>
      </div>

      {/* Platform Settlement Cycle & Margin Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Settlement Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>주문별 정산 장부 및 입금 현황</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              상태를 클릭하여 입금 완료로 변경 가능
            </span>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xs">
            {project.sales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">
                등록된 주문 내역이 없습니다. &apos;새 주문/정산 등록&apos; 버튼을 눌러보세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">주문일자</th>
                      <th className="px-5 py-3.5">채널 / 상품명</th>
                      <th className="px-5 py-3.5 text-right">매출액</th>
                      <th className="px-5 py-3.5 text-right">수수료</th>
                      <th className="px-5 py-3.5 text-right">정산예정액</th>
                      <th className="px-5 py-3.5 text-right">순이익</th>
                      <th className="px-5 py-3.5 text-center">정산상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-500 font-bold">
                          {sale.orderDate}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900 truncate max-w-[180px] text-sm">
                            {sale.productName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                            {sale.channel} • {sale.quantity}개
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                          ₩{sale.totalRevenue.toLocaleString('ko-KR')}
                        </td>
                        <td className="px-5 py-4 text-right text-red-600 font-black">
                          -₩{sale.platformFee.toLocaleString('ko-KR')}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                          ₩{sale.settlementExpectedAmount.toLocaleString('ko-KR')}
                        </td>
                        <td className="px-5 py-4 text-right font-black text-blue-600 text-sm">
                          +₩{sale.netProfit.toLocaleString('ko-KR')}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() =>
                              onUpdateSaleStatus(
                                sale.id,
                                sale.status === '입금완료' ? '구매확정' : '입금완료'
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${
                              sale.status === '입금완료'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : sale.status === '구매확정'
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {sale.status === '입금완료' ? '입금완료 ✓' : `${sale.status} → 입금처리`}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Margin & Fee Calculator */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>실시간 마진 시뮬레이터</span>
          </h2>

          <div className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-black mb-1">
                  소비자 판매가 (원)
                </label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  제품 제조 원가 (원)
                </label>
                <input
                  type="number"
                  value={calcCost}
                  onChange={(e) => setCalcCost(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    택배/배송비 (원)
                  </label>
                  <input
                    type="number"
                    value={calcShip}
                    onChange={(e) => setCalcShip(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    광고비 (건당)
                  </label>
                  <input
                    type="number"
                    value={calcAd}
                    onChange={(e) => setCalcAd(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-bold mb-1">
                  <span>플랫폼 수수료율 ({calcFeePercent}%)</span>
                  <span className="text-slate-400 font-normal">스토어: 3.8% / 쿠팡: 11%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={calcFeePercent}
                  onChange={(e) => setCalcFeePercent(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="pt-3 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-slate-500">플랫폼 수수료:</span>
                <span className="font-black text-red-600">-₩{calcFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">부가세(예비 보관금):</span>
                <span className="font-black text-slate-700">약 ₩{calcVat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-black text-slate-900">1개당 순이익:</span>
                <span className="font-black text-blue-600 text-base">
                  ₩{calcNet.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">최종 마진율:</span>
                <span className="font-black text-emerald-600 text-sm">{calcMargin}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Sale Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                신규 주문 / 판매 정산 등록
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  판매 채널
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="네이버 스마트스토어">네이버 스마트스토어 (수수료 ~3.8%)</option>
                  <option value="쿠팡">쿠팡 (수수료 ~11%)</option>
                  <option value="자사몰">자사몰 (PG사 수수료 ~3.3%)</option>
                  <option value="학교장터 S2B">학교장터 S2B (공공 수수료 ~1%)</option>
                  <option value="와디즈/텀블벅">크라우드펀딩 (수수료 ~9%)</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  상품명
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    판매 단가 (원)
                  </label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    수량
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    단위 제조원가
                  </label>
                  <input
                    type="number"
                    value={manufacturingCost}
                    onChange={(e) => setManufacturingCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    택배비
                  </label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    광고비
                  </label>
                  <input
                    type="number"
                    value={adCost}
                    onChange={(e) => setAdCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]"
                >
                  정산 장부에 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
