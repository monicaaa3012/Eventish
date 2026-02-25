import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiCall } from '../../config/api';

interface Analytics {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  rejectedBookings: number;
  acceptedBookings: number;
  scheduledBookings: number;
  inProgressBookings: number;
  totalRevenue: number;
  totalPotentialRevenue: number;
  pendingRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  yearToDateRevenue: number;
  monthlyRevenueGrowth: number;
  averageEarningPerBooking: number;
  pendingPaymentsCount: number;
  totalAdvancePayments: number;
  advancePaymentsCount: number;
  averageAdvancePayment: number;
  completedAdvancePayments: number;
  pendingAdvancePayments: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
    percentage: string;
  }>;
  averageRating: number;
  totalReviews: number;
  topPerformingService: {
    name: string;
    bookingCount: number;
    revenue: number;
    potentialRevenue: number;
    completionRate: string;
    performanceScore: number;
    advancePaymentsReceived: number;
  } | null;
  servicePerformance: Array<{
    serviceName: string;
    bookingCount: number;
    revenue: number;
    potentialRevenue: number;
    completedBookings: number;
    completionRate: string;
    performanceScore: number;
    rank: number;
    averagePrice: number;
    advancePaymentsReceived: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export default function VendorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const fetchAnalytics = async () => {
    try {
      setError('');
      const data = await apiCall('/analytics/vendor');
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return `NPR ${amount.toLocaleString('en-NP')}`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAnalytics}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <StatCard
            title="Active Bookings"
            value={analytics.activeBookings}
            color="#3B82F6"
            icon="calendar"
          />
          <StatCard
            title="Completed"
            value={analytics.completedBookings}
            color="#10B981"
            icon="checkmark-circle"
          />
          <StatCard
            title="Cancelled"
            value={analytics.cancelledBookings}
            color="#EF4444"
            icon="close-circle"
          />
          <StatCard
            title="Pending"
            value={analytics.pendingBookings}
            color="#F59E0B"
            icon="time"
          />
        </View>
      </View>

      {/* Revenue Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue</Text>
        <View style={styles.revenueCard}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Total Revenue (Received)</Text>
            <Text style={styles.revenueValue}>{formatCurrency(analytics.totalRevenue)}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Potential Revenue (All Bookings)</Text>
            <Text style={[styles.revenueValue, { fontSize: 20, color: '#6B7280' }]}>
              {formatCurrency(analytics.totalPotentialRevenue)}
            </Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Pending Payments</Text>
            <Text style={[styles.revenueValue, { fontSize: 20, color: '#F59E0B' }]}>
              {formatCurrency(analytics.pendingRevenue)}
            </Text>
            <Text style={styles.revenueSubtext}>
              {analytics.pendingPaymentsCount} booking{analytics.pendingPaymentsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>This Month</Text>
            <Text style={styles.revenueValue}>{formatCurrency(analytics.monthlyRevenue)}</Text>
            {analytics.monthlyRevenueGrowth !== 0 && (
              <View style={styles.growthBadge}>
                <Ionicons
                  name={analytics.monthlyRevenueGrowth > 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={analytics.monthlyRevenueGrowth > 0 ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.growthText,
                    { color: analytics.monthlyRevenueGrowth > 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {Math.abs(analytics.monthlyRevenueGrowth).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Year to Date</Text>
            <Text style={styles.revenueValue}>{formatCurrency(analytics.yearToDateRevenue)}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Avg per Booking</Text>
            <Text style={styles.revenueValue}>
              {formatCurrency(analytics.averageEarningPerBooking)}
            </Text>
          </View>
        </View>
      </View>

      {/* Advance Payments */}
      {analytics.advancePaymentsCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Advance Payments</Text>
          <View style={styles.advancePaymentCard}>
            <View style={styles.advancePaymentRow}>
              <View style={styles.advancePaymentItem}>
                <Text style={styles.advancePaymentLabel}>Total Received</Text>
                <Text style={styles.advancePaymentValue}>
                  {formatCurrency(analytics.completedAdvancePayments)}
                </Text>
              </View>
              <View style={styles.advancePaymentItem}>
                <Text style={styles.advancePaymentLabel}>Pending</Text>
                <Text style={[styles.advancePaymentValue, { color: '#F59E0B' }]}>
                  {formatCurrency(analytics.pendingAdvancePayments)}
                </Text>
              </View>
            </View>
            <View style={styles.advancePaymentDivider} />
            <View style={styles.advancePaymentRow}>
              <View style={styles.advancePaymentItem}>
                <Text style={styles.advancePaymentLabel}>Total Bookings</Text>
                <Text style={styles.advancePaymentValue}>{analytics.advancePaymentsCount}</Text>
              </View>
              <View style={styles.advancePaymentItem}>
                <Text style={styles.advancePaymentLabel}>Average Amount</Text>
                <Text style={styles.advancePaymentValue}>
                  {formatCurrency(analytics.averageAdvancePayment)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Payment Methods */}
      {analytics.paymentMethods && analytics.paymentMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {analytics.paymentMethods.map((method, index) => (
            <View key={index} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodHeader}>
                <View style={styles.paymentMethodIcon}>
                  <Ionicons
                    name={method.method === 'esewa' ? 'wallet' : 'cash'}
                    size={24}
                    color={method.method === 'esewa' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>
                    {method.method === 'esewa' ? 'eSewa' : 'Cash'}
                  </Text>
                  <Text style={styles.paymentMethodCount}>
                    {method.count} transaction{method.count !== 1 ? 's' : ''} ({method.percentage}%)
                  </Text>
                </View>
                <Text style={styles.paymentMethodAmount}>{formatCurrency(method.totalAmount)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Customer Satisfaction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Satisfaction</Text>
        <View style={styles.satisfactionRow}>
          <View style={styles.satisfactionCard}>
            <Ionicons name="star" size={32} color="#F59E0B" />
            <Text style={styles.satisfactionValue}>
              {analytics.averageRating.toFixed(1)}/5.0
            </Text>
            <Text style={styles.satisfactionLabel}>Average Rating</Text>
          </View>
          <View style={styles.satisfactionCard}>
            <Ionicons name="chatbubbles" size={32} color="#8B5CF6" />
            <Text style={styles.satisfactionValue}>{analytics.totalReviews}</Text>
            <Text style={styles.satisfactionLabel}>Total Reviews</Text>
          </View>
        </View>
      </View>

      {/* Top Performing Service */}
      {analytics.topPerformingService && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top Performing Service</Text>
          <View style={styles.topServiceCard}>
            <Text style={styles.topServiceName}>{analytics.topPerformingService.name}</Text>
            <View style={styles.topServiceStats}>
              <View style={styles.topServiceStat}>
                <Text style={styles.topServiceStatLabel}>Bookings</Text>
                <Text style={styles.topServiceStatValue}>
                  {analytics.topPerformingService.bookingCount}
                </Text>
              </View>
              <View style={styles.topServiceStat}>
                <Text style={styles.topServiceStatLabel}>Revenue</Text>
                <Text style={styles.topServiceStatValue}>
                  {formatCurrency(analytics.topPerformingService.revenue)}
                </Text>
              </View>
              <View style={styles.topServiceStat}>
                <Text style={styles.topServiceStatLabel}>Potential</Text>
                <Text style={styles.topServiceStatValue}>
                  {formatCurrency(analytics.topPerformingService.potentialRevenue)}
                </Text>
              </View>
              <View style={styles.topServiceStat}>
                <Text style={styles.topServiceStatLabel}>Completion</Text>
                <Text style={styles.topServiceStatValue}>
                  {analytics.topPerformingService.completionRate}%
                </Text>
              </View>
              <View style={styles.topServiceStat}>
                <Text style={styles.topServiceStatLabel}>Score</Text>
                <Text style={styles.topServiceStatValue}>
                  {analytics.topPerformingService.performanceScore}/100
                </Text>
              </View>
              {analytics.topPerformingService.advancePaymentsReceived > 0 && (
                <View style={styles.topServiceStat}>
                  <Text style={styles.topServiceStatLabel}>Advance Payments</Text>
                  <Text style={styles.topServiceStatValue}>
                    {formatCurrency(analytics.topPerformingService.advancePaymentsReceived)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Service Performance Ranking */}
      {analytics.servicePerformance && analytics.servicePerformance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Performance</Text>
          {analytics.servicePerformance.map((service, index) => (
            <View
              key={index}
              style={[
                styles.serviceCard,
                index === 0 && styles.serviceCardFirst,
                index === 1 && styles.serviceCardSecond,
                index === 2 && styles.serviceCardThird,
              ]}
            >
              <View style={styles.serviceHeader}>
                <View
                  style={[
                    styles.rankBadge,
                    index === 0 && styles.rankBadgeFirst,
                    index === 1 && styles.rankBadgeSecond,
                    index === 2 && styles.rankBadgeThird,
                  ]}
                >
                  <Text style={styles.rankText}>#{service.rank}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.serviceName}</Text>
                  <Text style={styles.serviceScore}>
                    Score: {service.performanceScore}/100
                  </Text>
                </View>
                <Text style={styles.serviceBookings}>{service.bookingCount} bookings</Text>
              </View>
              <View style={styles.serviceStats}>
                <View style={styles.serviceStat}>
                  <Text style={styles.serviceStatLabel}>Revenue (Received)</Text>
                  <Text style={styles.serviceStatValue}>{formatCurrency(service.revenue)}</Text>
                </View>
                <View style={styles.serviceStat}>
                  <Text style={styles.serviceStatLabel}>Potential Revenue</Text>
                  <Text style={[styles.serviceStatValue, { color: '#6B7280' }]}>
                    {formatCurrency(service.potentialRevenue)}
                  </Text>
                </View>
                <View style={styles.serviceStat}>
                  <Text style={styles.serviceStatLabel}>Completed</Text>
                  <Text style={styles.serviceStatValue}>{service.completedBookings}</Text>
                </View>
                <View style={styles.serviceStat}>
                  <Text style={styles.serviceStatLabel}>Completion Rate</Text>
                  <Text style={styles.serviceStatValue}>{service.completionRate}%</Text>
                </View>
                <View style={styles.serviceStat}>
                  <Text style={styles.serviceStatLabel}>Avg Price</Text>
                  <Text style={styles.serviceStatValue}>{formatCurrency(service.averagePrice)}</Text>
                </View>
                {service.advancePaymentsReceived > 0 && (
                  <View style={styles.serviceStat}>
                    <Text style={styles.serviceStatLabel}>Advance Payments</Text>
                    <Text style={[styles.serviceStatValue, { color: '#10B981' }]}>
                      {formatCurrency(service.advancePaymentsReceived)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const StatCard = ({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: any;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  revenueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  revenueItem: {
    paddingVertical: 12,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  revenueSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  revenueDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  advancePaymentCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  advancePaymentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  advancePaymentItem: {
    flex: 1,
  },
  advancePaymentLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 6,
  },
  advancePaymentValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
  },
  advancePaymentDivider: {
    height: 1,
    backgroundColor: '#FED7AA',
    marginVertical: 16,
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  paymentMethodCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentMethodAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  satisfactionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  satisfactionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  satisfactionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  satisfactionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  topServiceCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  topServiceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  topServiceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topServiceStat: {
    flex: 1,
    minWidth: '45%',
  },
  topServiceStatLabel: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  topServiceStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceCardFirst: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  serviceCardSecond: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  serviceCardThird: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeFirst: {
    backgroundColor: '#10B981',
  },
  rankBadgeSecond: {
    backgroundColor: '#3B82F6',
  },
  rankBadgeThird: {
    backgroundColor: '#F97316',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  serviceScore: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceBookings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  serviceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceStat: {
    flex: 1,
    minWidth: '45%',
  },
  serviceStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  serviceStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
