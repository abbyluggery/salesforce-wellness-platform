import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Searchbar, FAB, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCoupons, toggleCouponClipped, saveCoupon } from '../database/db';
import { format, isPast } from 'date-fns';

const CouponsScreen = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [searchQuery, filterType, coupons]);

  const loadCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const filterCoupons = () => {
    let filtered = coupons;

    if (filterType === 'clipped') {
      filtered = filtered.filter(c => c.is_clipped);
    } else if (filterType === 'available') {
      filtered = filtered.filter(c => !c.is_clipped);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.store.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCoupons(filtered);
  };

  const handleToggleClipped = async (id) => {
    await toggleCouponClipped(id);
    loadCoupons();
  };

  const getSavingsText = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    }
    return `$${coupon.discount_value} OFF`;
  };

  const CouponCard = ({ coupon }) => {
    const isExpired = isPast(new Date(coupon.expiration_date));

    return (
      <Card style={[styles.couponCard, isExpired && styles.expiredCard]}>
        <Card.Content>
          <View style={styles.couponHeader}>
            <View style={styles.storeInfo}>
              <Icon name="store" size={20} color="#f39c12" />
              <Paragraph style={styles.storeName}>{coupon.store}</Paragraph>
            </View>
            <Chip
              style={[
                styles.savingsChip,
                coupon.is_clipped && styles.clippedChip
              ]}
              textStyle={styles.savingsText}
              icon={() => (
                <Icon
                  name={coupon.is_clipped ? 'check' : 'scissors-cutting'}
                  size={16}
                  color="#fff"
                />
              )}
              onPress={() => handleToggleClipped(coupon.id)}
            >
              {getSavingsText(coupon)}
            </Chip>
          </View>

          <Title style={styles.productName}>{coupon.product_name}</Title>

          {coupon.description && (
            <Paragraph style={styles.description}>{coupon.description}</Paragraph>
          )}

          <View style={styles.couponFooter}>
            <View style={styles.expiryInfo}>
              <Icon name="calendar-clock" size={16} color="#7f8c8d" />
              <Paragraph style={styles.expiryText}>
                Expires {format(new Date(coupon.expiration_date), 'MMM dd, yyyy')}
              </Paragraph>
            </View>

            {coupon.coupon_code && (
              <Chip style={styles.codeChip} textStyle={styles.codeText}>
                Code: {coupon.coupon_code}
              </Chip>
            )}
          </View>

          {coupon.min_purchase_amount && (
            <Paragraph style={styles.minPurchase}>
              Min purchase: ${coupon.min_purchase_amount}
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  const getTotalSavings = () => {
    return filteredCoupons
      .filter(c => c.is_clipped)
      .reduce((sum, c) => sum + (c.discount_value || 0), 0);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{filteredCoupons.length}</Title>
              <Paragraph style={styles.statLabel}>Total Coupons</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {filteredCoupons.filter(c => c.is_clipped).length}
              </Title>
              <Paragraph style={styles.statLabel}>Clipped</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>${getTotalSavings().toFixed(2)}</Title>
              <Paragraph style={styles.statLabel}>Potential Savings</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Search coupons..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <SegmentedButtons
        value={filterType}
        onValueChange={setFilterType}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'available', label: 'Available' },
          { value: 'clipped', label: 'Clipped' },
        ]}
        style={styles.filterButtons}
      />

      <ScrollView style={styles.scrollView}>
        {filteredCoupons.map(coupon => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}

        {filteredCoupons.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="ticket-percent-outline" size={64} color="#bdc3c7" />
            <Title style={styles.emptyTitle}>No Coupons Found</Title>
            <Paragraph style={styles.emptyText}>
              Add coupons manually or sync with store APIs
            </Paragraph>
          </View>
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => Alert.alert('Add Coupon', 'Coming soon!')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  statsCard: { margin: 16, elevation: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#f39c12' },
  statLabel: { fontSize: 12, color: '#7f8c8d' },
  searchBar: { marginHorizontal: 16, marginBottom: 16, elevation: 2 },
  filterButtons: { marginHorizontal: 16, marginBottom: 16 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  couponCard: { marginBottom: 16, elevation: 2, backgroundColor: '#fff8e1' },
  expiredCard: { opacity: 0.5 },
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  storeInfo: { flexDirection: 'row', alignItems: 'center' },
  storeName: { marginLeft: 8, fontWeight: 'bold', color: '#f39c12' },
  savingsChip: { backgroundColor: '#f39c12' },
  clippedChip: { backgroundColor: '#4bca81' },
  savingsText: { color: '#fff', fontWeight: 'bold' },
  productName: { fontSize: 18, marginBottom: 8 },
  description: { fontSize: 14, color: '#7f8c8d', marginBottom: 12 },
  couponFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  expiryInfo: { flexDirection: 'row', alignItems: 'center' },
  expiryText: { marginLeft: 4, fontSize: 12, color: '#7f8c8d' },
  codeChip: { backgroundColor: '#e8f4f8' },
  codeText: { fontSize: 11, color: '#0176d3' },
  minPurchase: { fontSize: 12, color: '#7f8c8d', marginTop: 4, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { marginTop: 16 },
  emptyText: { textAlign: 'center', color: '#7f8c8d', marginTop: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#f39c12' },
});

export default CouponsScreen;
