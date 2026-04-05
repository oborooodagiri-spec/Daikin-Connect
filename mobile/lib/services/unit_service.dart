import 'package:dio/dio.dart';
import '../models/unit_model.dart';
import 'api_service.dart';

class UnitService {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> getUnitByToken(String token) async {
    try {
      final response = await _apiService.client.get('/units/$token');
      
      if (response.statusCode == 200) {
        final unit = UnitModel.fromJson(response.data['data']);
        return {'success': true, 'unit': unit};
      }
      return {'success': false, 'message': 'Unit not found'};
    } on DioException catch (e) {
      return {
        'success': false, 
        'message': e.response?.data['message'] ?? 'Network error'
      };
    }
  }
}
