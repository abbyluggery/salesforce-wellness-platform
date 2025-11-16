import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, FAB, Searchbar, Portal, Dialog } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRecipes, saveRecipe, toggleFavorite, updateRecipe } from '../database/db';

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, activeFilters, recipes]);

  const loadRecipes = async () => {
    try {
      const data = await getRecipes(activeFilters);
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRecipes(filtered);
  };

  const handleToggleFilter = (filterKey) => {
    const newFilters = { ...activeFilters };
    newFilters[filterKey] = !newFilters[filterKey];
    setActiveFilters(newFilters);
    loadRecipes();
  };

  const handleToggleFavorite = async (id) => {
    await toggleFavorite(id);
    loadRecipes();
  };

  const RecipeCard = ({ recipe }) => (
    <Card style={styles.recipeCard} onPress={() => setSelectedRecipe(recipe)}>
      <Card.Content>
        <View style={styles.recipeHeader}>
          <View style={styles.recipeInfo}>
            <Title style={styles.recipeName}>{recipe.name}</Title>
            <View style={styles.recipeIcons}>
              <Icon name="clock-outline" size={16} color="#7f8c8d" />
              <Paragraph style={styles.recipeTime}>{recipe.cook_time} min</Paragraph>
            </View>
          </View>
          <Icon
            name={recipe.is_favorite ? 'heart' : 'heart-outline'}
            size={28}
            color={recipe.is_favorite ? '#e74c3c' : '#7f8c8d'}
            onPress={() => handleToggleFavorite(recipe.id)}
          />
        </View>
        <View style={styles.chipContainer}>
          <Chip style={styles.categoryChip}>{recipe.category}</Chip>
          {recipe.is_heart_healthy === 1 && <Chip style={styles.healthChip}>❤️ Heart</Chip>}
          {recipe.is_diabetic_friendly === 1 && <Chip style={styles.healthChip}>🍃 Diabetic</Chip>}
          {recipe.is_low_sodium === 1 && <Chip style={styles.healthChip}>🧂 Low Sodium</Chip>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search recipes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <ScrollView horizontal style={styles.filterBar}>
        <Chip
          selected={activeFilters.isHeartHealthy}
          onPress={() => handleToggleFilter('isHeartHealthy')}
          style={styles.filterChip}
        >Heart Healthy</Chip>
        <Chip
          selected={activeFilters.isDiabeticFriendly}
          onPress={() => handleToggleFilter('isDiabeticFriendly')}
          style={styles.filterChip}
        >Diabetic Friendly</Chip>
        <Chip
          selected={activeFilters.isLowSodium}
          onPress={() => handleToggleFilter('isLowSodium')}
          style={styles.filterChip}
        >Low Sodium</Chip>
        <Chip
          selected={activeFilters.isFavorite}
          onPress={() => handleToggleFilter('isFavorite')}
          style={styles.filterChip}
        >Favorites</Chip>
      </ScrollView>
      <ScrollView style={styles.scrollView}>
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>
      <FAB icon="plus" style={styles.fab} onPress={() => setShowAddDialog(true)} />
      {selectedRecipe && (
        <Portal>
          <Dialog visible={!!selectedRecipe} onDismiss={() => setSelectedRecipe(null)}>
            <Dialog.Title>{selectedRecipe.name}</Dialog.Title>
            <Dialog.ScrollArea>
              <ScrollView>
                <Paragraph style={styles.sectionTitle}>Ingredients</Paragraph>
                <Paragraph>{selectedRecipe.ingredients}</Paragraph>
                <Paragraph style={styles.sectionTitle}>Instructions</Paragraph>
                <Paragraph>{selectedRecipe.instructions}</Paragraph>
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={() => setSelectedRecipe(null)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  searchBar: { margin: 16, elevation: 2 },
  filterBar: { paddingHorizontal: 16, marginBottom: 8 },
  filterChip: { marginRight: 8 },
  scrollView: { flex: 1, padding: 16, paddingTop: 0 },
  recipeCard: { marginBottom: 16, elevation: 2 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 18, marginBottom: 4 },
  recipeIcons: { flexDirection: 'row', alignItems: 'center' },
  recipeTime: { marginLeft: 4, fontSize: 14, color: '#7f8c8d' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  categoryChip: { backgroundColor: '#4bca81' },
  healthChip: { backgroundColor: '#e8f4f8' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#4bca81' },
  sectionTitle: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
});

export default RecipesScreen;
