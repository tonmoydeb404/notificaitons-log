import React, {useRef, useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SearchFilters} from '../../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  uniqueApps: string[];
  initialFilters?: SearchFilters;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  uniqueApps,
  initialFilters = {query: ''},
}) => {
  const [query, setQuery] = useState(initialFilters.query);
  const [selectedApp, setSelectedApp] = useState<string | undefined>(
    initialFilters.appName,
  );
  const [readFilter, setReadFilter] = useState<boolean | undefined>(
    initialFilters.isRead,
  );
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    const filters: SearchFilters = {
      query: query.trim(),
      appName: selectedApp,
      isRead: readFilter,
    };
    onSearch(filters);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedApp(undefined);
    setReadFilter(undefined);
    onSearch({query: ''});
    searchInputRef.current?.focus();
  };

  const hasActiveFilters =
    selectedApp || readFilter !== undefined || query.length > 0;

  return (
    <View className="mx-4 my-2">
      {/* Search Input */}
      <View className="flex-row items-center bg-white rounded-xl shadow-sm border border-gray-200">
        <View className="flex-1 flex-row items-center px-4 py-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            ref={searchInputRef}
            className="flex-1 text-gray-800 text-base"
            placeholder="Search notifications..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                handleSearch();
              }}
              className="ml-2 p-1">
              <Text className="text-gray-400">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-r-xl ${
            hasActiveFilters ? 'bg-blue-500' : 'bg-gray-100'
          }`}
          activeOpacity={0.7}>
          <Text
            className={`font-medium ${
              hasActiveFilters ? 'text-white' : 'text-gray-600'
            }`}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View className="mt-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Read Status Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Status
            </Text>
            <View className="flex-row">
              {[
                {label: 'All', value: undefined},
                {label: 'Unread', value: false},
                {label: 'Read', value: true},
              ].map(option => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => {
                    setReadFilter(option.value);
                    handleSearch();
                  }}
                  className={`mr-2 px-4 py-2 rounded-lg border ${
                    readFilter === option.value
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-sm font-medium ${
                      readFilter === option.value
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* App Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Filter by App
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedApp(undefined);
                  handleSearch();
                }}
                className={`mr-2 px-4 py-2 rounded-lg border ${
                  !selectedApp
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-50 border-gray-200'
                }`}
                activeOpacity={0.7}>
                <Text
                  className={`text-sm font-medium ${
                    !selectedApp ? 'text-white' : 'text-gray-700'
                  }`}>
                  All Apps
                </Text>
              </TouchableOpacity>

              {uniqueApps.slice(0, 10).map(app => (
                <TouchableOpacity
                  key={app}
                  onPress={() => {
                    setSelectedApp(app);
                    handleSearch();
                  }}
                  className={`mr-2 px-4 py-2 rounded-lg border ${
                    selectedApp === app
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-sm font-medium ${
                      selectedApp === app ? 'text-white' : 'text-gray-700'
                    }`}
                    numberOfLines={1}>
                    {app}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={clearFilters}
              className="flex-1 mr-2 p-3 bg-gray-100 rounded-lg"
              activeOpacity={0.7}>
              <Text className="text-gray-700 text-sm font-medium text-center">
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSearch}
              className="flex-1 ml-2 p-3 bg-blue-500 rounded-lg"
              activeOpacity={0.7}>
              <Text className="text-white text-sm font-medium text-center">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <View className="mt-2 flex-row flex-wrap">
          {query.length > 0 && (
            <View className="mr-2 mb-1 px-3 py-1 bg-blue-100 rounded-full">
              <Text className="text-blue-700 text-xs font-medium">
                Search: "{query}"
              </Text>
            </View>
          )}
          {selectedApp && (
            <View className="mr-2 mb-1 px-3 py-1 bg-purple-100 rounded-full">
              <Text className="text-purple-700 text-xs font-medium">
                App: {selectedApp}
              </Text>
            </View>
          )}
          {readFilter !== undefined && (
            <View className="mr-2 mb-1 px-3 py-1 bg-green-100 rounded-full">
              <Text className="text-green-700 text-xs font-medium">
                {readFilter ? 'Read' : 'Unread'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
