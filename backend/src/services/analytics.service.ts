import { prisma } from '../utils/prisma';

export class AnalyticsService {
  async getDashboardStats(userId: string) {
    const [total, byStatus, monthly, recent] = await Promise.all([
      prisma.application.count({ where: { userId } }),

      prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),

      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT
          TO_CHAR("appliedDate", 'YYYY-MM') as month,
          COUNT(*) as count
        FROM applications
        WHERE "userId" = ${userId}
          AND "appliedDate" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
      `,

      prisma.application.findMany({
        where: { userId },
        orderBy: { appliedDate: 'desc' },
        take: 5,
        select: { id: true, companyName: true, role: true, status: true, appliedDate: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count.status])
    );

    const interviews = statusMap['INTERVIEW'] || 0;
    const rejected = statusMap['REJECTED'] || 0;
    const offers = statusMap['OFFER'] || 0;

    return {
      total,
      byStatus: statusMap,
      rates: {
        interview: total > 0 ? Math.round((interviews / total) * 100) : 0,
        rejection: total > 0 ? Math.round((rejected / total) * 100) : 0,
        offer: total > 0 ? Math.round((offers / total) * 100) : 0,
      },
      monthly: monthly.map((m) => ({ month: m.month, count: Number(m.count) })),
      recentApplications: recent,
    };
  }

  async getApplicationTimeline(userId: string, days = 30) {
    const data = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE("appliedDate") as date,
        COUNT(*) as count
      FROM applications
      WHERE "userId" = ${userId}
        AND "appliedDate" >= NOW() - INTERVAL '${days} days'
      GROUP BY date
      ORDER BY date ASC
    `;

    return data.map((d) => ({ date: String(d.date), count: Number(d.count) }));
  }

  async getConversionFunnel(userId: string) {
    const counts = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const map = Object.fromEntries(counts.map((c) => [c.status, c._count.status]));
    const total = Object.values(map).reduce((a, b) => a + b, 0);

    const stages = ['APPLIED', 'OA', 'INTERVIEW', 'OFFER'];
    return stages.map((stage) => ({
      stage,
      count: map[stage] || 0,
      percentage: total > 0 ? Math.round(((map[stage] || 0) / total) * 100) : 0,
    }));
  }
}
