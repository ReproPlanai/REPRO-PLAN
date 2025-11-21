export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

export interface EmergencyLocation {
  location: LocationData;
  userId: string;
  phoneNumber: string;
  emergencyType: 'police' | 'medical' | 'fire' | 'general';
  message: string;
  isShared: boolean;
  shareTimestamp: string;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private emergencyLocations: EmergencyLocation[] = [];

  // Get current GPS location
  async getCurrentLocation(): Promise<{ success: boolean; location?: LocationData; error?: string }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          this.currentLocation = location;
          resolve({ success: true, location });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          resolve({
            success: false,
            error: errorMessage
          });
        },
        options
      );
    });
  }

  // Share location with emergency services
  async shareLocationWithEmergency(
    userId: string,
    phoneNumber: string,
    emergencyType: 'police' | 'medical' | 'fire' | 'general',
    message: string
  ): Promise<{ success: boolean; location?: LocationData; error?: string }> {
    try {
      // Get current location
      const locationResult = await this.getCurrentLocation();
      
      if (!locationResult.success || !locationResult.location) {
        return {
          success: false,
          error: locationResult.error || 'Failed to get location'
        };
      }

      const emergencyLocation: EmergencyLocation = {
        location: locationResult.location,
        userId,
        phoneNumber,
        emergencyType,
        message,
        isShared: true,
        shareTimestamp: new Date().toISOString()
      };

      this.emergencyLocations.push(emergencyLocation);

      // In a real app, this would send to emergency services
      console.log('Emergency location shared:', emergencyLocation);

      return {
        success: true,
        location: locationResult.location
      };
    } catch (error) {
      console.error('Error sharing location with emergency services:', error);
      return {
        success: false,
        error: 'Failed to share location with emergency services'
      };
    }
  }

  // Get emergency location history
  getEmergencyLocationHistory(): EmergencyLocation[] {
    return this.emergencyLocations;
  }

  // Format location for display
  formatLocation(location: LocationData): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Generate Google Maps link
  generateMapsLink(location: LocationData): string {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  // Generate emergency message with location
  generateEmergencyMessage(
    location: LocationData,
    emergencyType: string,
    message: string
  ): string {
    const coordinates = this.formatLocation(location);
    const mapsLink = this.generateMapsLink(location);
    
    return `EMERGENCY ALERT - ${emergencyType.toUpperCase()}
    
Location: ${coordinates}
Google Maps: ${mapsLink}

Message: ${message}

Time: ${new Date(location.timestamp).toLocaleString()}

This is an automated emergency alert from Safe Link SRHR app.`;
  }

  // Check if location sharing is available
  isLocationSharingAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  // Request location permissions
  async requestLocationPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!this.isLocationSharingAvailable()) {
      return {
        granted: false,
        error: 'Geolocation is not supported by this browser'
      };
    }

    try {
      const result = await this.getCurrentLocation();
      return {
        granted: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        granted: false,
        error: 'Failed to request location permission'
      };
    }
  }
}

export const locationService = new LocationService();
