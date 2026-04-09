class UnitModel {
  final String id;
  final String unitTag;
  final String projectName;
  final String unitType;
  final String brand;
  final String model;
  final String capacity;
  final String status;
  final String roomTenant; // Standardized terminology used in legacy code
  final String projectId;

  UnitModel({
    required this.id,
    required this.unitTag,
    required this.projectName,
    required this.unitType,
    required this.brand,
    required this.model,
    required this.capacity,
    required this.status,
    required this.roomTenant,
    required this.projectId,
  });

  factory UnitModel.fromJson(Map<String, dynamic> json) {
    return UnitModel(
      id: json['id']?.toString() ?? '',
      unitTag: json['tag_number']?.toString() ?? (json['unitTag']?.toString() ?? 'NO-TAG'),
      projectName: json['projectName']?.toString() ?? (json['project_name']?.toString() ?? 'No Project'),
      unitType: json['unit_type']?.toString() ?? 'Uncategorized',
      brand: json['brand']?.toString() ?? 'Daikin',
      model: json['model']?.toString() ?? '',
      capacity: json['capacity']?.toString() ?? '',
      status: json['status']?.toString() ?? 'Normal',
      roomTenant: json['room_tenant']?.toString() ?? (json['area']?.toString() ?? 'General Area'),
      projectId: json['project_ref_id']?.toString() ?? '',
    );
  }
}
