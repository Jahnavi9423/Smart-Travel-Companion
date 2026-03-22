import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import ImageViewer from 'react-native-image-zoom-viewer';


import { getDestinationImages } from '@/utils/imageFetcher';

interface ImageGalleryProps {
  city: string;
  count?: number;
}

export default function ImageGallery({ city, count = 4 }: ImageGalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadImages() {
      setLoading(true);
      try {
        const results = await getDestinationImages(city, count);
        if (!cancelled) {
          setImages(results);
        }
      } catch (e) {
        console.log('ImageGallery load error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImages();
    return () => { cancelled = true; };
  }, [city, count]);

  const handleImagePress = (index: number) => {
    setSelectedIndex(index);
    setIsViewerVisible(true);
  };

  const imageUrls = images.map(url => ({ url }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photos of {city}</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {images.map((uri, i) => (
            <TouchableOpacity key={uri + i} activeOpacity={0.9} onPress={() => handleImagePress(i)}>
              <Image
                source={{ uri }}
                style={styles.img}
                contentFit="cover"
                onError={(e) => console.log('ImageGallery load error', e)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={isViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setIsViewerVisible(false)}>
        <ImageViewer
          imageUrls={imageUrls}
          index={selectedIndex}
          enableSwipeDown={true}
          onSwipeDown={() => setIsViewerVisible(false)}
          onClick={() => setIsViewerVisible(false)}
          renderIndicator={(currentIndex, allSize) => (
            <View style={styles.indicatorContainer}>
              <Text style={styles.indicatorText}>{currentIndex} / {allSize}</Text>
            </View>
          )}
          renderHeader={() => (
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsViewerVisible(false)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { marginTop: 12, paddingHorizontal: 20 },
  title: { fontSize: 13, fontWeight: '700' as const, color: Colors.text, marginBottom: 10 },
  row: { paddingBottom: 6 },
  img: {
    width: Math.min(260, Math.round(width * 0.6)),
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.background,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  indicatorText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
});
