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
  monthlyRevenue: number;
  averageEarningPerBooking: number;
  averageRating: number;
  totalReviews: number;
  topPerformingService: {
    name: string;
    bookingCount: number;
    revenue: number;
    completionRate: string;
    performanceScore: number;
  } | null;
  servicePerformance: Array<{
    serviceName: string;
    bookingCount: number;
    revenue: number;
    completedBookings: number;
    completionRate: string;
    performanceScore: number;
    rank: number;
    averagePrice: number;
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
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>{formatCurrency(analytics.totalRevenue)}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Monthly Revenue</Text>
            <Text style={styles.revenueValue}>{formatCurrency(analytics.monthlyRevenue)}</Text>
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
                  <Text style={styles.serviceStatLabel}>Revenue</Text>
                  <Text style={styles.serviceStatValue}>{formatCurrency(service.revenue)}</Text>
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
  revenueDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
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
