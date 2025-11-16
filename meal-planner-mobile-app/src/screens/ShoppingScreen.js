import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Checkbox, Chip, Portal, Dialog, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getShoppingLists, getShoppingItems, createShoppingList, addShoppingItem, toggleItemPurchased, getShoppingListStats } from '../database/db';
import { optimizeShoppingList } from '../services/claudeService';
import { format } from 'date-fns';

const ShoppingScreen = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [items, setItems] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const loadShoppingLists = async () => {
    try {
      const lists = await getShoppingLists();
      setShoppingLists(lists);
      if (lists.length > 0 && !selectedList) {
        selectList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  const selectList = async (list) => {
    setSelectedList(list);
    const listItems = await getShoppingItems(list.id);
    setItems(listItems);
    const listStats = await getShoppingListStats(list.id);
    setStats(listStats);
  };

  const handleTogglePurchased = async (itemId) => {
    await toggleItemPurchased(itemId);
    if (selectedList) {
      const listItems = await getShoppingItems(selectedList.id);
      setItems(listItems);
      const listStats = await getShoppingListStats(selectedList.id);
      setStats(listStats);
    }
  };

  const handleOptimizeList = async () => {
    if (!items.length) return;
    try {
      const result = await optimizeShoppingList(items, selectedList.store_preference);
      if (result.success) {
        Alert.alert(
          'List Optimized',
          `Organized by department. Found ${result.seasonalItems?.length || 0} seasonal items and ${result.bulkOpportunities?.length || 0} bulk opportunities.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to optimize list');
    }
  };

  const groupItemsByCategory = () => {
    const grouped = {};
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const itemsByCategory = groupItemsByCategory();

  return (
    <View style={styles.container}>
      {selectedList && (
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title>{selectedList.name}</Title>
            {stats && (
              <View style={styles.statsRow}>
                <Paragraph>
                  {stats.purchasedItems} / {stats.totalItems} items
                </Paragraph>
                <Paragraph style={styles.totalCost}>
                  Total: ${stats.totalCost.toFixed(2)}
                </Paragraph>
              </View>
            )}
            <Button
              mode="outlined"
              icon="brain"
              onPress={handleOptimizeList}
              style={styles.optimizeButton}
              compact
            >
              Optimize with AI
            </Button>
          </Card.Content>
        </Card>
      )}

      <ScrollView style={styles.scrollView}>
        {Object.keys(itemsByCategory).map(category => (
          <Card key={category} style={styles.categoryCard}>
            <Card.Content>
              <Title style={styles.categoryTitle}>{category}</Title>
              {itemsByCategory[category].map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <Checkbox
                    status={item.is_purchased ? 'checked' : 'unchecked'}
                    onPress={() => handleTogglePurchased(item.id)}
                  />
                  <View style={styles.itemInfo}>
                    <Paragraph style={[
                      styles.itemName,
                      item.is_purchased && styles.purchasedText
                    ]}>
                      {item.item_name}
                    </Paragraph>
                    <Paragraph style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Paragraph>
                  </View>
                  {item.estimated_price && (
                    <Paragraph style={styles.itemPrice}>
                      ${item.estimated_price.toFixed(2)}
                    </Paragraph>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        {!selectedList && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Icon name="cart-outline" size={64} color="#bdc3c7" style={styles.emptyIcon} />
              <Title style={styles.emptyTitle}>No Shopping Lists</Title>
              <Paragraph style={styles.emptyText}>
                Create a shopping list to track your groceries
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowCreateDialog(true)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  headerCard: { margin: 16, elevation: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalCost: { fontWeight: 'bold', color: '#4bca81' },
  optimizeButton: { marginTop: 8 },
  scrollView: { flex: 1 },
  categoryCard: { margin: 16, marginTop: 0, elevation: 2 },
  categoryTitle: { fontSize: 16, marginBottom: 12, color: '#4bca81' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemInfo: { flex: 1, marginLeft: 8 },
  itemName: { fontSize: 16 },
  purchasedText: { textDecorationLine: 'line-through', color: '#7f8c8d' },
  itemQuantity: { fontSize: 12, color: '#7f8c8d' },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  emptyCard: { marginTop: 60, alignItems: 'center' },
  emptyIcon: { alignSelf: 'center', marginBottom: 16 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#7f8c8d' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#3498db' },
});

export default ShoppingScreen;
