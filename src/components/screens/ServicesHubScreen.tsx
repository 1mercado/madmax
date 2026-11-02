import React from 'react';
import {
  ChevronRight,
  CreditCard,
  Gift,
  Phone,
  PiggyBank,
  QrCode,
  Receipt,
  Rocket,
  Send,
  Sliders,
  Star,
  Users,
} from 'lucide-react';
import { useDigiCash } from '../../context/DigiCashContext';
import { GlassCard } from '../common/GlassCard';

export const ServicesHubScreen: React.FC = () => {
  const { navigateTo } = useDigiCash();

  return (
    <div className="w-full space-y-6 pb-24 pt-2 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">All Services</h2>
        <p className="text-xs text-slate-400">Explore the complete DigiCash ecosystem</p>
      </div>

      {/* Financial & Transfers */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider">
          Financial & Transfers
        </h3>
        <GlassCard className="p-2 divide-y divide-[#00e5ff]/10">
          {[
            {
              icon: Sliders,
              color: '#00e5ff',
              title: 'Budget Planner',
              subtitle: 'Category spending limits & remaining balance progress',
              action: () => navigateTo('BUDGET_PLANNER'),
            },
            {
              icon: Send,
              color: '#00e5ff',
              title: 'Send Money',
              subtitle: 'To Mobile, Bank, GCash & Maya',
              action: () => navigateTo('SEND_MONEY'),
            },
            {
              icon: QrCode,
              color: '#00f5a0',
              title: 'Scan QR Ph to Pay',
              subtitle: 'Instant camera scan for merchants & users',
              action: () => navigateTo('QR_SCANNER'),
            },
            {
              icon: CreditCard,
              color: '#80d8ff',
              title: 'My QR Code & Account',
              subtitle: 'Receive funds from any bank or e-wallet',
              action: () => navigateTo('RECEIVE_MONEY'),
            },
            {
              icon: Receipt,
              color: '#b06ab3',
              title: 'Pay Bills',
              subtitle: 'Utilities, Government, Telecom, Loans',
              action: () => navigateTo('PAY_BILLS'),
            },
            {
              icon: Phone,
              color: '#40c4ff',
              title: 'Buy Load & Gaming Pins',
              subtitle: 'Smart, Globe, DITO, TNT, MLBB, Steam',
              action: () => navigateTo('TOP_UP'),
            },
            {
              icon: PiggyBank,
              color: '#00f5a0',
              title: 'Savings Vault (6.0% P.A.)',
              subtitle: 'Goal-based savings with visual progress tracking',
              action: () => navigateTo('SAVINGS_VAULT'),
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.action}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            );
          })}
        </GlassCard>
      </div>

      {/* Referral Network & VIP Tiers */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-[#ffb300] uppercase tracking-wider">
          Referral Network & VIP Tiers
        </h3>
        <GlassCard className="p-2 divide-y divide-[#00e5ff]/10">
          {[
            {
              icon: Rocket,
              color: '#00f5a0',
              title: 'Builder Pack Upgrade (₱5,000)',
              subtitle: 'Unlocks Levels 4-10 • Instant 40% rebate',
              action: () => navigateTo('BUILDER_UPGRADE'),
            },
            {
              icon: Users,
              color: '#00e5ff',
              title: 'Referral Program & 10-Level Tree',
              subtitle: '10% direct + unilevel commissions',
              action: () => navigateTo('REFERRALS'),
            },
            {
              icon: Star,
              color: '#ffb300',
              title: 'VIP Membership Club',
              subtitle: 'VIP 1, 2, 3 Infinity Pool share',
              action: () => navigateTo('VIP_TIERS'),
            },
            {
              icon: Gift,
              color: '#ff80ab',
              title: 'Rewards Center',
              subtitle: 'Redeem points for cash vouchers & load',
              action: () => navigateTo('REWARDS'),
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.action}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}22`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            );
          })}
        </GlassCard>
      </div>
    </div>
  );
};
