class UnitModel {
  final String id;
  final String unitTag;
  final String projectName;
  final String unitType;
  final String brand;
  final String model;
  final String capacity;
  final String status;
  final String area;
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
    required this.area,
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
      area: json['area']?.toString() ?? 'General',
      projectId: json['project_ref_id']?.toString() ?? '',
    );
  }
}
