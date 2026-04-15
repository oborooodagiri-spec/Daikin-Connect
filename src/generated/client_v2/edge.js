
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/edge.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CustomersScalarFieldEnum = {
  id: 'id',
  name: 'name',
  pic_name: 'pic_name',
  bidang_usaha: 'bidang_usaha',
  pic_phone: 'pic_phone',
  customer_type: 'customer_type',
  address: 'address',
  created_at: 'created_at',
  is_active: 'is_active'
};

exports.Prisma.PermissionsScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.ProjectsScalarFieldEnum = {
  id: 'id',
  customer_id: 'customer_id',
  name: 'name',
  code: 'code',
  status: 'status',
  created_at: 'created_at',
  enabled_forms: 'enabled_forms'
};

exports.Prisma.Refresh_tokensScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  token_hash: 'token_hash',
  expires_at: 'expires_at',
  revoked_at: 'revoked_at',
  created_at: 'created_at'
};

exports.Prisma.Role_permissionsScalarFieldEnum = {
  role_id: 'role_id',
  permission_id: 'permission_id'
};

exports.Prisma.RolesScalarFieldEnum = {
  id: 'id',
  role_name: 'role_name'
};

exports.Prisma.UnitsScalarFieldEnum = {
  id: 'id',
  project_id: 'project_id',
  project_type: 'project_type',
  unit_type: 'unit_type',
  site_id: 'site_id',
  qr_code_token: 'qr_code_token',
  tag_number: 'tag_number',
  code: 'code',
  customer_name: 'customer_name',
  customer_group: 'customer_group',
  location: 'location',
  area: 'area',
  building_floor: 'building_floor',
  room_tenant: 'room_tenant',
  brand: 'brand',
  model: 'model',
  capacity: 'capacity',
  yoi: 'yoi',
  serial_number: 'serial_number',
  status: 'status',
  last_service_date: 'last_service_date',
  created_at: 'created_at',
  project_ref_id: 'project_ref_id'
};

exports.Prisma.User_project_accessScalarFieldEnum = {
  user_id: 'user_id',
  project_id: 'project_id'
};

exports.Prisma.User_rolesScalarFieldEnum = {
  user_id: 'user_id',
  role_id: 'role_id'
};

exports.Prisma.User_unit_accessScalarFieldEnum = {
  user_id: 'user_id',
  unit_id: 'unit_id'
};

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  role_id: 'role_id',
  name: 'name',
  email: 'email',
  password: 'password',
  phone: 'phone',
  is_active: 'is_active',
  company_name: 'company_name',
  two_factor_enabled: 'two_factor_enabled',
  two_factor_secret: 'two_factor_secret',
  otp_code: 'otp_code',
  otp_expiry: 'otp_expiry',
  failed_login_attempts: 'failed_login_attempts',
  locked_until: 'locked_until',
  attendance_enabled: 'attendance_enabled',
  face_reference_url: 'face_reference_url',
  face_verification_enabled: 'face_verification_enabled'
};

exports.Prisma.Audit_logsScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  action: 'action',
  target_type: 'target_type',
  target_id: 'target_id',
  details: 'details',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  created_at: 'created_at'
};

exports.Prisma.Password_reset_tokensScalarFieldEnum = {
  id: 'id',
  email: 'email',
  token_hash: 'token_hash',
  expires_at: 'expires_at',
  created_at: 'created_at'
};

exports.Prisma.ActivitiesScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  type: 'type',
  service_date: 'service_date',
  inspector_name: 'inspector_name',
  engineer_note: 'engineer_note',
  technical_advice: 'technical_advice',
  voltage: 'voltage',
  current_amp: 'current_amp',
  pressure: 'pressure',
  photo_url: 'photo_url',
  pdf_report_url: 'pdf_report_url',
  created_at: 'created_at',
  technical_json: 'technical_json',
  status: 'status',
  deleted_at: 'deleted_at'
};

exports.Prisma.Activity_photosScalarFieldEnum = {
  id: 'id',
  activity_id: 'activity_id',
  type: 'type',
  photo_url: 'photo_url',
  notes: 'notes',
  description: 'description',
  caption: 'caption',
  media_type: 'media_type'
};

exports.Prisma.Ahu_auditsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  location: 'location',
  unit_tag: 'unit_tag',
  audit_date: 'audit_date',
  prepared_by: 'prepared_by',
  design_airflow: 'design_airflow',
  design_cooling_capacity: 'design_cooling_capacity',
  leaving_db: 'leaving_db',
  leaving_wb: 'leaving_wb',
  leaving_rh: 'leaving_rh',
  entering_db: 'entering_db',
  entering_wb: 'entering_wb',
  entering_rh: 'entering_rh',
  room_db: 'room_db',
  room_wb: 'room_wb',
  room_rh: 'room_rh',
  chws_temp: 'chws_temp',
  chwr_temp: 'chwr_temp',
  chws_press: 'chws_press',
  chwr_press: 'chwr_press',
  water_flow_gpm: 'water_flow_gpm',
  amp_r: 'amp_r',
  amp_s: 'amp_s',
  amp_t: 'amp_t',
  volt_rs: 'volt_rs',
  volt_st: 'volt_st',
  volt_rt: 'volt_rt',
  volt_ln: 'volt_ln',
  visual_notes: 'visual_notes',
  recommendation: 'recommendation',
  pdf_url: 'pdf_url',
  created_at: 'created_at',
  approval_status: 'approval_status',
  approved_by: 'approved_by'
};

exports.Prisma.Audit_ticketsScalarFieldEnum = {
  id: 'id',
  ticket_number: 'ticket_number',
  unit_id: 'unit_id',
  auditor_name: 'auditor_name',
  audit_date: 'audit_date',
  physical_condition: 'physical_condition',
  suction_pressure: 'suction_pressure',
  discharge_pressure: 'discharge_pressure',
  ampere: 'ampere',
  voltage: 'voltage',
  notes: 'notes',
  finding_status: 'finding_status',
  created_at: 'created_at'
};

exports.Prisma.Audit_velocity_pointsScalarFieldEnum = {
  id: 'id',
  audit_id: 'audit_id',
  point_number: 'point_number',
  velocity_value: 'velocity_value'
};

exports.Prisma.AuditsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  room_tenant: 'room_tenant',
  type: 'type',
  notes: 'notes',
  status: 'status',
  photo_url: 'photo_url',
  created_at: 'created_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.ContractsScalarFieldEnum = {
  id: 'id',
  customer_id: 'customer_id',
  site_id: 'site_id',
  contract_number: 'contract_number',
  start_date: 'start_date',
  end_date: 'end_date',
  service_frequency: 'service_frequency',
  status: 'status'
};

exports.Prisma.CorrectiveScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  service_date: 'service_date',
  technician_name: 'technician_name',
  case_complain: 'case_complain',
  root_cause: 'root_cause',
  temp_action: 'temp_action',
  perm_action: 'perm_action',
  recommendation: 'recommendation',
  photo_url: 'photo_url',
  status: 'status',
  created_at: 'created_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.Corrective_maintenancesScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  tech_name: 'tech_name',
  issue_description: 'issue_description',
  created_at: 'created_at',
  inspector_name: 'inspector_name',
  repair_date: 'repair_date',
  finding: 'finding',
  advise: 'advise',
  report_pdf: 'report_pdf'
};

exports.Prisma.Maintenance_contractsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  technician_name: 'technician_name',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.Service_activitiesScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  type: 'type',
  reference_id: 'reference_id',
  engineer_id: 'engineer_id',
  sales_engineer_id: 'sales_engineer_id',
  pdf_report_url: 'pdf_report_url',
  photo_url: 'photo_url',
  service_date: 'service_date',
  status: 'status',
  engineer_note: 'engineer_note',
  sales_note: 'sales_note',
  created_at: 'created_at',
  inspector_name: 'inspector_name',
  technical_json: 'technical_json',
  technical_advice: 'technical_advice',
  location: 'location',
  unit_tag: 'unit_tag',
  design_airflow: 'design_airflow',
  design_cooling_capacity: 'design_cooling_capacity',
  entering_db: 'entering_db',
  entering_wb: 'entering_wb',
  entering_rh: 'entering_rh',
  leaving_db: 'leaving_db',
  leaving_wb: 'leaving_wb',
  leaving_rh: 'leaving_rh',
  room_db: 'room_db',
  room_wb: 'room_wb',
  room_rh: 'room_rh',
  chws_temp: 'chws_temp',
  chwr_temp: 'chwr_temp',
  chws_press: 'chws_press',
  chwr_press: 'chwr_press',
  water_flow_gpm: 'water_flow_gpm',
  amp_r: 'amp_r',
  amp_s: 'amp_s',
  amp_t: 'amp_t',
  volt_rs: 'volt_rs',
  volt_st: 'volt_st',
  volt_rt: 'volt_rt',
  volt_ln: 'volt_ln',
  berita_acara_pdf_url: 'berita_acara_pdf_url',
  customer_approved_at: 'customer_approved_at',
  customer_approver_name: 'customer_approver_name',
  engineer_signer_name: 'engineer_signer_name',
  is_approved_by_customer: 'is_approved_by_customer',
  deleted_at: 'deleted_at'
};

exports.Prisma.Service_logsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  service_date: 'service_date',
  service_type: 'service_type',
  technician_name: 'technician_name',
  description: 'description',
  status_after: 'status_after',
  created_at: 'created_at'
};

exports.Prisma.Service_photosScalarFieldEnum = {
  id: 'id',
  log_id: 'log_id',
  photo_path: 'photo_path',
  description: 'description',
  created_at: 'created_at'
};

exports.Prisma.SitesScalarFieldEnum = {
  id: 'id',
  customer_id: 'customer_id',
  site_name: 'site_name',
  address: 'address',
  gps_location: 'gps_location',
  project_type: 'project_type',
  progress_value: 'progress_value'
};

exports.Prisma.TicketsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  customer_id: 'customer_id',
  subject: 'subject',
  description: 'description',
  priority: 'priority',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.Unit_commentsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  user_name: 'user_name',
  comment: 'comment',
  created_at: 'created_at'
};

exports.Prisma.SchedulesScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  start_at: 'start_at',
  end_at: 'end_at',
  type: 'type',
  status: 'status',
  google_event_id: 'google_event_id',
  project_id: 'project_id',
  unit_id: 'unit_id',
  assignee_id: 'assignee_id',
  created_at: 'created_at'
};

exports.Prisma.Schedule_attendanceScalarFieldEnum = {
  id: 'id',
  schedule_id: 'schedule_id',
  name: 'name',
  role: 'role',
  is_present: 'is_present',
  signature: 'signature',
  created_at: 'created_at'
};

exports.Prisma.Schedule_momScalarFieldEnum = {
  id: 'id',
  schedule_id: 'schedule_id',
  content: 'content',
  updated_at: 'updated_at'
};

exports.Prisma.Schedule_messagesScalarFieldEnum = {
  id: 'id',
  schedule_id: 'schedule_id',
  user_id: 'user_id',
  message: 'message',
  attachments: 'attachments',
  is_system: 'is_system',
  system_type: 'system_type',
  created_at: 'created_at'
};

exports.Prisma.Schedule_targetsScalarFieldEnum = {
  id: 'id',
  assignee_id: 'assignee_id',
  project_id: 'project_id',
  type: 'type',
  daily_target: 'daily_target',
  monthly_target: 'monthly_target',
  month: 'month',
  year: 'year',
  yearly_target: 'yearly_target'
};

exports.Prisma.ComplaintsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  customer_name: 'customer_name',
  description: 'description',
  photo_url: 'photo_url',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.User_push_tokensScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  token: 'token',
  platform: 'platform',
  created_at: 'created_at'
};

exports.Prisma.Daily_ops_logsScalarFieldEnum = {
  id: 'id',
  unit_id: 'unit_id',
  inspector_name: 'inspector_name',
  service_date: 'service_date',
  created_at: 'created_at',
  fan_on: 'fan_on',
  fan_speed: 'fan_speed',
  fan_curr_r: 'fan_curr_r',
  fan_curr_s: 'fan_curr_s',
  fan_curr_t: 'fan_curr_t',
  fan_volt_r: 'fan_volt_r',
  fan_volt_s: 'fan_volt_s',
  fan_volt_t: 'fan_volt_t',
  heater_on: 'heater_on',
  heater_curr_r: 'heater_curr_r',
  heater_curr_s: 'heater_curr_s',
  heater_curr_t: 'heater_curr_t',
  heater_volt_r: 'heater_volt_r',
  heater_volt_s: 'heater_volt_s',
  heater_volt_t: 'heater_volt_t',
  valve_opening: 'valve_opening',
  supply_temp: 'supply_temp',
  supply_rh: 'supply_rh',
  return_temp: 'return_temp',
  return_rh: 'return_rh',
  fresh_temp: 'fresh_temp',
  fresh_rh: 'fresh_rh',
  filter_pre: 'filter_pre',
  filter_med: 'filter_med',
  filter_hepa: 'filter_hepa',
  room_temp: 'room_temp',
  room_diff_press: 'room_diff_press',
  temp_s1: 'temp_s1',
  temp_s2: 'temp_s2',
  temp_s3: 'temp_s3',
  temp_s4: 'temp_s4',
  temp_s5: 'temp_s5',
  static_pressure: 'static_pressure',
  vibration_status: 'vibration_status',
  drainage_status: 'drainage_status',
  notes: 'notes'
};

exports.Prisma.Vendor_attendanceScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  project_id: 'project_id',
  check_in_time: 'check_in_time',
  check_out_time: 'check_out_time',
  check_in_lat: 'check_in_lat',
  check_in_long: 'check_in_long',
  check_out_lat: 'check_out_lat',
  check_out_long: 'check_out_long',
  check_in_photo: 'check_in_photo',
  check_out_photo: 'check_out_photo'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.customersOrderByRelevanceFieldEnum = {
  name: 'name',
  pic_name: 'pic_name',
  bidang_usaha: 'bidang_usaha',
  pic_phone: 'pic_phone',
  address: 'address'
};

exports.Prisma.permissionsOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.projectsOrderByRelevanceFieldEnum = {
  name: 'name',
  code: 'code',
  enabled_forms: 'enabled_forms'
};

exports.Prisma.refresh_tokensOrderByRelevanceFieldEnum = {
  token_hash: 'token_hash'
};

exports.Prisma.rolesOrderByRelevanceFieldEnum = {
  role_name: 'role_name'
};

exports.Prisma.unitsOrderByRelevanceFieldEnum = {
  project_id: 'project_id',
  project_type: 'project_type',
  unit_type: 'unit_type',
  qr_code_token: 'qr_code_token',
  tag_number: 'tag_number',
  code: 'code',
  customer_name: 'customer_name',
  customer_group: 'customer_group',
  location: 'location',
  area: 'area',
  building_floor: 'building_floor',
  room_tenant: 'room_tenant',
  brand: 'brand',
  model: 'model',
  capacity: 'capacity',
  serial_number: 'serial_number'
};

exports.Prisma.usersOrderByRelevanceFieldEnum = {
  name: 'name',
  email: 'email',
  password: 'password',
  phone: 'phone',
  company_name: 'company_name',
  two_factor_secret: 'two_factor_secret',
  otp_code: 'otp_code',
  face_reference_url: 'face_reference_url'
};

exports.Prisma.audit_logsOrderByRelevanceFieldEnum = {
  action: 'action',
  target_type: 'target_type',
  target_id: 'target_id',
  details: 'details',
  ip_address: 'ip_address',
  user_agent: 'user_agent'
};

exports.Prisma.password_reset_tokensOrderByRelevanceFieldEnum = {
  email: 'email',
  token_hash: 'token_hash'
};

exports.Prisma.activitiesOrderByRelevanceFieldEnum = {
  type: 'type',
  inspector_name: 'inspector_name',
  engineer_note: 'engineer_note',
  technical_advice: 'technical_advice',
  voltage: 'voltage',
  current_amp: 'current_amp',
  pressure: 'pressure',
  photo_url: 'photo_url',
  pdf_report_url: 'pdf_report_url',
  technical_json: 'technical_json',
  status: 'status'
};

exports.Prisma.activity_photosOrderByRelevanceFieldEnum = {
  type: 'type',
  photo_url: 'photo_url',
  notes: 'notes',
  description: 'description',
  caption: 'caption',
  media_type: 'media_type'
};

exports.Prisma.ahu_auditsOrderByRelevanceFieldEnum = {
  location: 'location',
  unit_tag: 'unit_tag',
  prepared_by: 'prepared_by',
  visual_notes: 'visual_notes',
  recommendation: 'recommendation',
  pdf_url: 'pdf_url',
  approved_by: 'approved_by'
};

exports.Prisma.audit_ticketsOrderByRelevanceFieldEnum = {
  ticket_number: 'ticket_number',
  auditor_name: 'auditor_name',
  suction_pressure: 'suction_pressure',
  discharge_pressure: 'discharge_pressure',
  ampere: 'ampere',
  voltage: 'voltage',
  notes: 'notes'
};

exports.Prisma.auditsOrderByRelevanceFieldEnum = {
  room_tenant: 'room_tenant',
  type: 'type',
  notes: 'notes',
  photo_url: 'photo_url'
};

exports.Prisma.contractsOrderByRelevanceFieldEnum = {
  contract_number: 'contract_number'
};

exports.Prisma.correctiveOrderByRelevanceFieldEnum = {
  technician_name: 'technician_name',
  case_complain: 'case_complain',
  root_cause: 'root_cause',
  temp_action: 'temp_action',
  perm_action: 'perm_action',
  recommendation: 'recommendation',
  photo_url: 'photo_url',
  status: 'status'
};

exports.Prisma.corrective_maintenancesOrderByRelevanceFieldEnum = {
  tech_name: 'tech_name',
  issue_description: 'issue_description',
  inspector_name: 'inspector_name',
  finding: 'finding',
  advise: 'advise',
  report_pdf: 'report_pdf'
};

exports.Prisma.maintenance_contractsOrderByRelevanceFieldEnum = {
  technician_name: 'technician_name',
  status: 'status'
};

exports.Prisma.service_activitiesOrderByRelevanceFieldEnum = {
  pdf_report_url: 'pdf_report_url',
  photo_url: 'photo_url',
  engineer_note: 'engineer_note',
  sales_note: 'sales_note',
  inspector_name: 'inspector_name',
  technical_json: 'technical_json',
  technical_advice: 'technical_advice',
  location: 'location',
  unit_tag: 'unit_tag',
  berita_acara_pdf_url: 'berita_acara_pdf_url',
  customer_approver_name: 'customer_approver_name',
  engineer_signer_name: 'engineer_signer_name'
};

exports.Prisma.service_logsOrderByRelevanceFieldEnum = {
  technician_name: 'technician_name',
  description: 'description'
};

exports.Prisma.service_photosOrderByRelevanceFieldEnum = {
  photo_path: 'photo_path',
  description: 'description'
};

exports.Prisma.sitesOrderByRelevanceFieldEnum = {
  site_name: 'site_name',
  address: 'address',
  gps_location: 'gps_location'
};

exports.Prisma.ticketsOrderByRelevanceFieldEnum = {
  subject: 'subject',
  description: 'description'
};

exports.Prisma.unit_commentsOrderByRelevanceFieldEnum = {
  user_name: 'user_name',
  comment: 'comment'
};

exports.Prisma.schedulesOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description',
  google_event_id: 'google_event_id'
};

exports.Prisma.schedule_attendanceOrderByRelevanceFieldEnum = {
  name: 'name',
  role: 'role',
  signature: 'signature'
};

exports.Prisma.schedule_momOrderByRelevanceFieldEnum = {
  content: 'content'
};

exports.Prisma.schedule_messagesOrderByRelevanceFieldEnum = {
  message: 'message',
  attachments: 'attachments',
  system_type: 'system_type'
};

exports.Prisma.complaintsOrderByRelevanceFieldEnum = {
  customer_name: 'customer_name',
  description: 'description',
  photo_url: 'photo_url',
  status: 'status'
};

exports.Prisma.user_push_tokensOrderByRelevanceFieldEnum = {
  token: 'token',
  platform: 'platform'
};

exports.Prisma.daily_ops_logsOrderByRelevanceFieldEnum = {
  inspector_name: 'inspector_name',
  filter_pre: 'filter_pre',
  filter_med: 'filter_med',
  filter_hepa: 'filter_hepa',
  vibration_status: 'vibration_status',
  drainage_status: 'drainage_status',
  notes: 'notes'
};

exports.Prisma.vendor_attendanceOrderByRelevanceFieldEnum = {
  check_in_photo: 'check_in_photo',
  check_out_photo: 'check_out_photo'
};
exports.projects_status = exports.$Enums.projects_status = {
  active: 'active',
  archived: 'archived'
};

exports.service_activities_type = exports.$Enums.service_activities_type = {
  Audit: 'Audit',
  Preventive: 'Preventive',
  Corrective: 'Corrective'
};

exports.service_logs_service_type = exports.$Enums.service_logs_service_type = {
  Cleaning: 'Cleaning',
  Repair: 'Repair',
  Maintenance: 'Maintenance',
  Part_Replacement: 'Part_Replacement'
};

exports.tickets_priority = exports.$Enums.tickets_priority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical'
};

exports.audit_tickets_physical_condition = exports.$Enums.audit_tickets_physical_condition = {
  Good: 'Good',
  Dirty: 'Dirty',
  Damaged: 'Damaged'
};

exports.audits_status = exports.$Enums.audits_status = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.customers_customer_type = exports.$Enums.customers_customer_type = {
  Corporate: 'Corporate',
  Individual: 'Individual'
};

exports.sites_project_type = exports.$Enums.sites_project_type = {
  Maintenance: 'Maintenance',
  Audit: 'Audit',
  Corrective: 'Corrective'
};

exports.service_logs_status_after = exports.$Enums.service_logs_status_after = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.tickets_status = exports.$Enums.tickets_status = {
  Open: 'Open',
  In_Progress: 'In_Progress',
  Resolved: 'Resolved',
  Closed: 'Closed'
};

exports.contracts_status = exports.$Enums.contracts_status = {
  Active: 'Active',
  Expired: 'Expired',
  Pending: 'Pending'
};

exports.service_activities_status = exports.$Enums.service_activities_status = {
  Pending: 'Pending',
  Engineer_Approved: 'Engineer_Approved',
  Final_Approved: 'Final_Approved',
  Rejected: 'Rejected'
};

exports.audit_tickets_finding_status = exports.$Enums.audit_tickets_finding_status = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.units_status = exports.$Enums.units_status = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical',
  Problem: 'Problem',
  Pending: 'Pending',
  On_Progress: 'On_Progress'
};

exports.ahu_audits_approval_status = exports.$Enums.ahu_audits_approval_status = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected'
};

exports.ScheduleType = exports.$Enums.ScheduleType = {
  Preventive: 'Preventive',
  Corrective: 'Corrective',
  Audit: 'Audit',
  DailyLog: 'DailyLog'
};

exports.ScheduleStatus = exports.$Enums.ScheduleStatus = {
  Planned: 'Planned',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Missed: 'Missed'
};

exports.Prisma.ModelName = {
  customers: 'customers',
  permissions: 'permissions',
  projects: 'projects',
  refresh_tokens: 'refresh_tokens',
  role_permissions: 'role_permissions',
  roles: 'roles',
  units: 'units',
  user_project_access: 'user_project_access',
  user_roles: 'user_roles',
  user_unit_access: 'user_unit_access',
  users: 'users',
  audit_logs: 'audit_logs',
  password_reset_tokens: 'password_reset_tokens',
  activities: 'activities',
  activity_photos: 'activity_photos',
  ahu_audits: 'ahu_audits',
  audit_tickets: 'audit_tickets',
  audit_velocity_points: 'audit_velocity_points',
  audits: 'audits',
  contracts: 'contracts',
  corrective: 'corrective',
  corrective_maintenances: 'corrective_maintenances',
  maintenance_contracts: 'maintenance_contracts',
  service_activities: 'service_activities',
  service_logs: 'service_logs',
  service_photos: 'service_photos',
  sites: 'sites',
  tickets: 'tickets',
  unit_comments: 'unit_comments',
  schedules: 'schedules',
  schedule_attendance: 'schedule_attendance',
  schedule_mom: 'schedule_mom',
  schedule_messages: 'schedule_messages',
  schedule_targets: 'schedule_targets',
  complaints: 'complaints',
  user_push_tokens: 'user_push_tokens',
  daily_ops_logs: 'daily_ops_logs',
  vendor_attendance: 'vendor_attendance'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\src\\generated\\client_v2",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\D22AGRI-EPL\\Desktop\\daikin-connect-clean\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "6.4.1",
  "engineVersion": "a9055b89e58b4b5bfb59600785423b1db3d0e75d",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/client_v2\"\n}\n\ndatasource db {\n  provider = \"mysql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel customers {\n  id            Int                      @id @default(autoincrement())\n  name          String                   @db.VarChar(150)\n  pic_name      String?                  @db.VarChar(100)\n  bidang_usaha  String?                  @db.VarChar(100)\n  pic_phone     String?                  @db.VarChar(20)\n  customer_type customers_customer_type? @default(Corporate)\n  address       String?                  @db.Text\n  created_at    DateTime?                @default(now()) @db.Timestamp(0)\n  is_active     Boolean                  @default(true)\n  contracts     contracts[]\n  projects      projects[]\n  sites         sites[]\n  tickets       tickets[]\n}\n\nmodel permissions {\n  id               BigInt             @id @default(autoincrement()) @db.UnsignedBigInt\n  name             String             @unique(map: \"name\") @db.VarChar(80)\n  role_permissions role_permissions[]\n}\n\nmodel projects {\n  id                  BigInt                @id @default(autoincrement()) @db.UnsignedBigInt\n  customer_id         Int\n  name                String                @db.VarChar(150)\n  code                String?               @db.VarChar(50)\n  status              projects_status       @default(active)\n  created_at          DateTime              @default(now()) @db.Timestamp(0)\n  enabled_forms       String?               @db.Text\n  customers           customers             @relation(fields: [customer_id], references: [id], onUpdate: Restrict, map: \"fk_projects_customer\")\n  schedule_targets    schedule_targets[]\n  schedules           schedules[]\n  units               units[]\n  user_project_access user_project_access[]\n  vendor_attendance   vendor_attendance[]\n\n  @@unique([customer_id, name], map: \"uq_project_per_customer\")\n  @@index([customer_id], map: \"idx_projects_customer\")\n}\n\nmodel refresh_tokens {\n  id         BigInt    @id @default(autoincrement()) @db.UnsignedBigInt\n  user_id    Int\n  token_hash String    @unique(map: \"uniq_token_hash\") @db.VarChar(255)\n  expires_at DateTime  @db.DateTime(0)\n  revoked_at DateTime? @db.DateTime(0)\n  created_at DateTime? @default(now()) @db.DateTime(0)\n  users      users     @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_refresh_user\")\n\n  @@unique([user_id, revoked_at], map: \"uniq_active_token_per_user\")\n  @@index([user_id], map: \"idx_user_id\")\n}\n\nmodel role_permissions {\n  role_id       Int\n  permission_id BigInt      @db.UnsignedBigInt\n  permissions   permissions @relation(fields: [permission_id], references: [id], onUpdate: Restrict, map: \"fk_rp_perm\")\n  roles         roles       @relation(fields: [role_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_rp_role\")\n\n  @@id([role_id, permission_id])\n  @@index([permission_id], map: \"fk_rp_perm\")\n}\n\nmodel roles {\n  id               Int                @id @default(autoincrement())\n  role_name        String             @db.VarChar(50)\n  role_permissions role_permissions[]\n  user_roles       user_roles[]\n  users            users[]\n}\n\nmodel units {\n  id                 Int                  @id @default(autoincrement())\n  project_id         String?              @db.VarChar(50)\n  project_type       String?              @db.VarChar(100)\n  unit_type          String?              @db.VarChar(100)\n  site_id            Int?\n  qr_code_token      String?              @unique(map: \"qr_code_token\") @db.VarChar(100)\n  tag_number         String?              @db.VarChar(20)\n  code               String?              @db.VarChar(50)\n  customer_name      String?              @db.VarChar(150)\n  customer_group     String?              @db.VarChar(150)\n  location           String?              @db.VarChar(255)\n  area               String?              @db.VarChar(100)\n  building_floor     String?              @db.VarChar(100)\n  room_tenant        String?              @db.VarChar(150)\n  brand              String?              @default(\"Daikin\") @db.VarChar(100)\n  model              String?              @db.VarChar(150)\n  capacity           String?              @db.VarChar(50)\n  yoi                Int?\n  serial_number      String?              @unique(map: \"serial_number\") @db.VarChar(100)\n  status             units_status?        @default(Normal)\n  last_service_date  DateTime?            @db.Date\n  created_at         DateTime?            @default(now()) @db.Timestamp(0)\n  project_ref_id     BigInt?              @db.UnsignedBigInt\n  activities         activities[]\n  audit_tickets      audit_tickets[]\n  audits             audits[]\n  complaints         complaints[]\n  corrective         corrective[]\n  daily_ops_logs     daily_ops_logs[]\n  schedules          schedules[]\n  service_activities service_activities[]\n  service_logs       service_logs[]\n  tickets            tickets[]\n  unit_comments      unit_comments[]\n  projects           projects?            @relation(fields: [project_ref_id], references: [id], onUpdate: Restrict, map: \"fk_units_project_ref\")\n  user_unit_access   user_unit_access[]\n\n  @@index([project_ref_id], map: \"fk_units_project_ref\")\n}\n\nmodel user_project_access {\n  user_id    Int\n  project_id BigInt   @db.UnsignedBigInt\n  projects   projects @relation(fields: [project_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_upa_project\")\n  users      users    @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_upa_user\")\n\n  @@id([user_id, project_id])\n  @@index([project_id], map: \"fk_upa_project\")\n}\n\nmodel user_roles {\n  user_id Int\n  role_id Int\n  roles   roles @relation(fields: [role_id], references: [id], onUpdate: Restrict, map: \"fk_ur_role\")\n  users   users @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_ur_user\")\n\n  @@id([user_id, role_id])\n  @@index([role_id], map: \"fk_ur_role\")\n}\n\nmodel user_unit_access {\n  user_id Int\n  unit_id Int\n  units   units @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_uua_unit\")\n  users   users @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_uua_user\")\n\n  @@id([user_id, unit_id])\n  @@index([unit_id], map: \"fk_uua_unit\")\n}\n\nmodel users {\n  id           Int     @id @default(autoincrement())\n  role_id      Int?\n  name         String  @db.VarChar(150)\n  email        String  @unique(map: \"email\") @db.VarChar(150)\n  password     String  @db.VarChar(255)\n  phone        String? @db.VarChar(20)\n  is_active    Boolean @default(true)\n  company_name String? @db.VarChar(150)\n\n  // Security & 2FA\n  two_factor_enabled        Boolean   @default(true)\n  two_factor_secret         String?   @db.VarChar(255)\n  otp_code                  String?   @db.VarChar(6)\n  otp_expiry                DateTime? @db.DateTime(0)\n  failed_login_attempts     Int       @default(0)\n  locked_until              DateTime? @db.DateTime(0)\n  attendance_enabled        Boolean   @default(false)\n  face_reference_url        String?   @db.VarChar(255)\n  face_verification_enabled Boolean   @default(true)\n\n  refresh_tokens      refresh_tokens[]\n  schedule_messages   schedule_messages[]\n  schedule_targets    schedule_targets[]\n  schedules           schedules[]\n  service_activities  service_activities[]\n  user_project_access user_project_access[]\n  user_push_tokens    user_push_tokens[]\n  user_roles          user_roles[]\n  user_unit_access    user_unit_access[]\n  audit_logs          audit_logs[]\n  roles               roles?                @relation(fields: [role_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"users_ibfk_1\")\n  vendor_attendance   vendor_attendance[]\n\n  @@index([role_id], map: \"role_id\")\n}\n\nmodel audit_logs {\n  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt\n  user_id     Int?\n  action      String    @db.VarChar(100)\n  target_type String?   @db.VarChar(50)\n  target_id   String?   @db.VarChar(100)\n  details     String?   @db.Text\n  ip_address  String?   @db.VarChar(45)\n  user_agent  String?   @db.Text\n  created_at  DateTime? @default(now()) @db.Timestamp(0)\n  users       users?    @relation(fields: [user_id], references: [id], onDelete: SetNull, onUpdate: Restrict, map: \"fk_audit_user\")\n\n  @@index([user_id], map: \"idx_audit_user\")\n}\n\nmodel password_reset_tokens {\n  id         Int      @id @default(autoincrement())\n  email      String   @unique(map: \"email_reset\") @db.VarChar(150)\n  token_hash String   @unique(map: \"token_hash\") @db.VarChar(255)\n  expires_at DateTime @db.DateTime(0)\n  created_at DateTime @default(now()) @db.Timestamp(0)\n}\n\nmodel activities {\n  id               Int       @id @default(autoincrement())\n  unit_id          Int\n  type             String?   @db.VarChar(50)\n  service_date     DateTime  @db.Date\n  inspector_name   String?   @db.VarChar(100)\n  engineer_note    String?   @db.Text\n  technical_advice String?   @db.Text\n  voltage          String?   @db.VarChar(50)\n  current_amp      String?   @db.VarChar(50)\n  pressure         String?   @db.VarChar(50)\n  photo_url        String?   @db.VarChar(255)\n  pdf_report_url   String?   @db.VarChar(255)\n  created_at       DateTime? @default(now()) @db.Timestamp(0)\n  technical_json   String?   @db.LongText\n  status           String?   @default(\"Completed\") @db.VarChar(50)\n  deleted_at       DateTime? @db.DateTime(0)\n  units            units     @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_unit_activity\")\n\n  @@index([unit_id], map: \"fk_unit_activity\")\n}\n\nmodel activity_photos {\n  id                 Int                 @id @default(autoincrement())\n  activity_id        Int?\n  type               String?             @default(\"AUDIT\") @db.VarChar(50)\n  photo_url          String              @db.VarChar(255)\n  notes              String?             @db.Text\n  description        String?             @db.Text\n  caption            String?             @db.Text\n  media_type         String              @default(\"image\") @db.VarChar(10)\n  service_activities service_activities? @relation(fields: [activity_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"activity_photos_ibfk_1\")\n\n  @@index([activity_id], map: \"activity_id\")\n}\n\nmodel ahu_audits {\n  id                      Int                         @id @default(autoincrement())\n  unit_id                 Int?\n  location                String?                     @db.VarChar(255)\n  unit_tag                String?                     @db.VarChar(100)\n  audit_date              DateTime?                   @db.Date\n  prepared_by             String?                     @db.VarChar(100)\n  design_airflow          Decimal?                    @db.Decimal(10, 2)\n  design_cooling_capacity Decimal?                    @db.Decimal(10, 2)\n  leaving_db              Decimal?                    @db.Decimal(5, 2)\n  leaving_wb              Decimal?                    @db.Decimal(5, 2)\n  leaving_rh              Decimal?                    @db.Decimal(5, 2)\n  entering_db             Decimal?                    @db.Decimal(5, 2)\n  entering_wb             Decimal?                    @db.Decimal(5, 2)\n  entering_rh             Decimal?                    @db.Decimal(5, 2)\n  room_db                 Decimal?                    @db.Decimal(5, 2)\n  room_wb                 Decimal?                    @db.Decimal(5, 2)\n  room_rh                 Decimal?                    @db.Decimal(5, 2)\n  chws_temp               Decimal?                    @db.Decimal(5, 2)\n  chwr_temp               Decimal?                    @db.Decimal(5, 2)\n  chws_press              Decimal?                    @db.Decimal(5, 2)\n  chwr_press              Decimal?                    @db.Decimal(5, 2)\n  water_flow_gpm          Decimal?                    @db.Decimal(10, 2)\n  amp_r                   Decimal?                    @db.Decimal(5, 2)\n  amp_s                   Decimal?                    @db.Decimal(5, 2)\n  amp_t                   Decimal?                    @db.Decimal(5, 2)\n  volt_rs                 Int?\n  volt_st                 Int?\n  volt_rt                 Int?\n  volt_ln                 Int?\n  visual_notes            String?                     @db.Text\n  recommendation          String?                     @db.Text\n  pdf_url                 String?                     @db.VarChar(255)\n  created_at              DateTime?                   @default(now()) @db.Timestamp(0)\n  approval_status         ahu_audits_approval_status? @default(Pending)\n  approved_by             String?                     @db.VarChar(100)\n}\n\nmodel audit_tickets {\n  id                 Int                               @id @default(autoincrement())\n  ticket_number      String?                           @unique(map: \"ticket_number\") @db.VarChar(20)\n  unit_id            Int?\n  auditor_name       String?                           @db.VarChar(100)\n  audit_date         DateTime?                         @db.Date\n  physical_condition audit_tickets_physical_condition?\n  suction_pressure   String?                           @db.VarChar(20)\n  discharge_pressure String?                           @db.VarChar(20)\n  ampere             String?                           @db.VarChar(20)\n  voltage            String?                           @db.VarChar(20)\n  notes              String?                           @db.Text\n  finding_status     audit_tickets_finding_status?\n  created_at         DateTime?                         @default(now()) @db.Timestamp(0)\n  units              units?                            @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"audit_tickets_ibfk_1\")\n\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel audit_velocity_points {\n  id                 Int                 @id @default(autoincrement())\n  audit_id           Int?\n  point_number       Int?\n  velocity_value     Decimal?            @db.Decimal(5, 2)\n  service_activities service_activities? @relation(fields: [audit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"audit_velocity_points_ibfk_1\")\n\n  @@index([audit_id], map: \"audit_velocity_points_ibfk_1\")\n}\n\nmodel audits {\n  id          Int            @id @default(autoincrement())\n  unit_id     Int\n  room_tenant String?        @db.VarChar(150)\n  type        String?        @default(\"Audit\") @db.VarChar(50)\n  notes       String?        @db.Text\n  status      audits_status? @default(Normal)\n  photo_url   String?        @db.VarChar(255)\n  created_at  DateTime?      @default(now()) @db.Timestamp(0)\n  deleted_at  DateTime?      @db.DateTime(0)\n  units       units          @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"audits_ibfk_1\")\n\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel contracts {\n  id                Int               @id @default(autoincrement())\n  customer_id       Int?\n  site_id           Int?\n  contract_number   String?           @unique(map: \"contract_number\") @db.VarChar(100)\n  start_date        DateTime?         @db.Date\n  end_date          DateTime?         @db.Date\n  service_frequency Int?\n  status            contracts_status? @default(Active)\n  customers         customers?        @relation(fields: [customer_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"contracts_ibfk_1\")\n\n  @@index([customer_id], map: \"customer_id\")\n}\n\nmodel corrective {\n  id              Int       @id @default(autoincrement())\n  unit_id         Int\n  service_date    DateTime  @db.Date\n  technician_name String?   @db.VarChar(100)\n  case_complain   String?   @db.Text\n  root_cause      String?   @db.Text\n  temp_action     String?   @db.Text\n  perm_action     String?   @db.Text\n  recommendation  String?   @db.Text\n  photo_url       String?   @db.Text\n  status          String?   @default(\"Final Approved\") @db.VarChar(50)\n  created_at      DateTime? @default(now()) @db.Timestamp(0)\n  deleted_at      DateTime? @db.DateTime(0)\n  units           units     @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"corrective_ibfk_1\")\n\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel corrective_maintenances {\n  id                Int       @id @default(autoincrement())\n  unit_id           Int?\n  tech_name         String?   @db.VarChar(255)\n  issue_description String?   @db.Text\n  created_at        DateTime? @default(now()) @db.Timestamp(0)\n  inspector_name    String?   @db.VarChar(255)\n  repair_date       DateTime? @db.Date\n  finding           String?   @db.Text\n  advise            String?   @db.Text\n  report_pdf        String?   @db.VarChar(255)\n}\n\nmodel maintenance_contracts {\n  id              Int       @id @default(autoincrement())\n  unit_id         Int?\n  technician_name String?   @db.VarChar(255)\n  status          String?   @db.Text\n  created_at      DateTime? @default(now()) @db.Timestamp(0)\n}\n\nmodel service_activities {\n  id                      Int                        @id @default(autoincrement())\n  unit_id                 Int?\n  type                    service_activities_type\n  reference_id            Int?\n  engineer_id             Int?\n  sales_engineer_id       Int?\n  pdf_report_url          String?                    @db.VarChar(255)\n  photo_url               String?                    @db.VarChar(255)\n  service_date            DateTime?                  @db.Date\n  status                  service_activities_status? @default(Pending)\n  engineer_note           String?                    @db.Text\n  sales_note              String?                    @db.Text\n  created_at              DateTime?                  @default(now()) @db.Timestamp(0)\n  inspector_name          String?                    @db.VarChar(255)\n  technical_json          String?                    @db.LongText\n  technical_advice        String?                    @db.Text\n  location                String?                    @db.VarChar(255)\n  unit_tag                String?                    @db.VarChar(100)\n  design_airflow          Float?                     @default(0) @db.Float\n  design_cooling_capacity Float?                     @default(0) @db.Float\n  entering_db             Float?                     @default(0) @db.Float\n  entering_wb             Float?                     @default(0) @db.Float\n  entering_rh             Float?                     @default(0) @db.Float\n  leaving_db              Float?                     @default(0) @db.Float\n  leaving_wb              Float?                     @default(0) @db.Float\n  leaving_rh              Float?                     @default(0) @db.Float\n  room_db                 Float?                     @default(0) @db.Float\n  room_wb                 Float?                     @default(0) @db.Float\n  room_rh                 Float?                     @default(0) @db.Float\n  chws_temp               Float?                     @default(0) @db.Float\n  chwr_temp               Float?                     @default(0) @db.Float\n  chws_press              Float?                     @default(0) @db.Float\n  chwr_press              Float?                     @default(0) @db.Float\n  water_flow_gpm          Float?                     @default(0) @db.Float\n  amp_r                   Decimal?                   @default(0.00) @db.Decimal(5, 2)\n  amp_s                   Decimal?                   @default(0.00) @db.Decimal(5, 2)\n  amp_t                   Decimal?                   @default(0.00) @db.Decimal(5, 2)\n  volt_rs                 Int?                       @default(0)\n  volt_st                 Int?                       @default(0)\n  volt_rt                 Int?                       @default(0)\n  volt_ln                 Int?                       @default(0)\n  berita_acara_pdf_url    String?                    @db.VarChar(255)\n  customer_approved_at    DateTime?                  @db.DateTime(0)\n  customer_approver_name  String?                    @db.VarChar(255)\n  engineer_signer_name    String?                    @db.VarChar(255)\n  is_approved_by_customer Boolean?                   @default(false)\n  deleted_at              DateTime?                  @db.DateTime(0)\n  activity_photos         activity_photos[]\n  audit_velocity_points   audit_velocity_points[]\n  units                   units?                     @relation(fields: [unit_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"service_activities_ibfk_1\")\n  users                   users?                     @relation(fields: [engineer_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"service_activities_ibfk_2\")\n\n  @@index([engineer_id], map: \"engineer_id\")\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel service_logs {\n  id              Int                        @id @default(autoincrement())\n  unit_id         Int?\n  service_date    DateTime?                  @db.Date\n  service_type    service_logs_service_type?\n  technician_name String?                    @db.VarChar(100)\n  description     String?                    @db.Text\n  status_after    service_logs_status_after?\n  created_at      DateTime?                  @default(now()) @db.Timestamp(0)\n  units           units?                     @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"service_logs_ibfk_1\")\n\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel service_photos {\n  id          Int       @id @default(autoincrement())\n  log_id      Int?\n  photo_path  String?   @db.VarChar(255)\n  description String?   @db.Text\n  created_at  DateTime? @default(now()) @db.Timestamp(0)\n}\n\nmodel sites {\n  id             Int                 @id @default(autoincrement())\n  customer_id    Int?\n  site_name      String              @db.VarChar(150)\n  address        String?             @db.Text\n  gps_location   String?             @db.VarChar(100)\n  project_type   sites_project_type? @default(Maintenance)\n  progress_value Int?                @default(0)\n  customers      customers?          @relation(fields: [customer_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"fk_customer\")\n\n  @@index([customer_id], map: \"fk_customer\")\n}\n\nmodel tickets {\n  id          Int               @id @default(autoincrement())\n  unit_id     Int?\n  customer_id Int?\n  subject     String?           @db.VarChar(255)\n  description String?           @db.Text\n  priority    tickets_priority?\n  status      tickets_status?   @default(Open)\n  created_at  DateTime?         @default(now()) @db.Timestamp(0)\n  units       units?            @relation(fields: [unit_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"tickets_ibfk_1\")\n  customers   customers?        @relation(fields: [customer_id], references: [id], onDelete: Restrict, onUpdate: Restrict, map: \"tickets_ibfk_2\")\n\n  @@index([customer_id], map: \"customer_id\")\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel unit_comments {\n  id         Int       @id @default(autoincrement())\n  unit_id    Int\n  user_name  String?   @default(\"Customer\") @db.VarChar(100)\n  comment    String    @db.Text\n  created_at DateTime? @default(now()) @db.Timestamp(0)\n  units      units     @relation(fields: [unit_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: \"unit_comments_ibfk_1\")\n\n  @@index([unit_id], map: \"unit_id\")\n}\n\nmodel schedules {\n  id                  BigInt                @id @default(autoincrement()) @db.UnsignedBigInt\n  title               String                @db.VarChar(150)\n  description         String?               @db.Text\n  start_at            DateTime              @db.DateTime(0)\n  end_at              DateTime              @db.DateTime(0)\n  type                ScheduleType\n  status              ScheduleStatus        @default(Planned)\n  google_event_id     String?               @db.VarChar(255)\n  project_id          BigInt                @db.UnsignedBigInt\n  unit_id             Int?\n  assignee_id         Int?\n  created_at          DateTime              @default(now()) @db.Timestamp(0)\n  schedule_attendance schedule_attendance[]\n  schedule_messages   schedule_messages[]\n  schedule_mom        schedule_mom[]\n  users               users?                @relation(fields: [assignee_id], references: [id])\n  projects            projects              @relation(fields: [project_id], references: [id], onDelete: Cascade)\n  units               units?                @relation(fields: [unit_id], references: [id])\n\n  @@index([project_id])\n  @@index([unit_id])\n  @@index([assignee_id])\n}\n\nmodel schedule_attendance {\n  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt\n  schedule_id BigInt    @db.UnsignedBigInt\n  name        String    @db.VarChar(150)\n  role        String?   @db.VarChar(100)\n  is_present  Boolean   @default(false)\n  signature   String?   @db.LongText\n  created_at  DateTime  @default(now()) @db.Timestamp(0)\n  schedules   schedules @relation(fields: [schedule_id], references: [id], onDelete: Cascade)\n\n  @@index([schedule_id])\n}\n\nmodel schedule_mom {\n  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt\n  schedule_id BigInt    @db.UnsignedBigInt\n  content     String    @db.LongText\n  updated_at  DateTime  @updatedAt\n  schedules   schedules @relation(fields: [schedule_id], references: [id], onDelete: Cascade)\n\n  @@index([schedule_id])\n}\n\nmodel schedule_messages {\n  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt\n  schedule_id BigInt    @db.UnsignedBigInt\n  user_id     Int?\n  message     String    @db.LongText\n  attachments String?   @db.LongText\n  is_system   Boolean   @default(false)\n  system_type String?   @db.VarChar(50)\n  created_at  DateTime  @default(now()) @db.Timestamp(0)\n  schedules   schedules @relation(fields: [schedule_id], references: [id], onDelete: Cascade)\n  users       users?    @relation(fields: [user_id], references: [id])\n\n  @@index([schedule_id])\n  @@index([user_id])\n}\n\nmodel schedule_targets {\n  id             Int          @id @default(autoincrement())\n  assignee_id    Int?\n  project_id     BigInt?      @db.UnsignedBigInt\n  type           ScheduleType\n  daily_target   Int          @default(0)\n  monthly_target Int          @default(0)\n  month          Int\n  year           Int\n  yearly_target  Int          @default(0)\n  users          users?       @relation(fields: [assignee_id], references: [id], onDelete: Cascade)\n  projects       projects?    @relation(fields: [project_id], references: [id], onDelete: Cascade)\n\n  @@index([assignee_id, type, month, year])\n  @@index([project_id, type, month, year])\n  @@index([assignee_id])\n  @@index([project_id])\n}\n\nmodel complaints {\n  id            Int      @id @default(autoincrement())\n  unit_id       Int\n  customer_name String   @db.VarChar(150)\n  description   String   @db.Text\n  photo_url     String?  @db.VarChar(255)\n  status        String   @default(\"Pending\")\n  created_at    DateTime @default(now()) @db.Timestamp(0)\n  units         units    @relation(fields: [unit_id], references: [id], onDelete: Cascade)\n\n  @@index([unit_id], map: \"idx_complaint_unit\")\n}\n\nmodel user_push_tokens {\n  id         Int      @id @default(autoincrement())\n  user_id    Int\n  token      String   @unique @db.VarChar(512)\n  platform   String   @default(\"web\") @db.VarChar(50)\n  created_at DateTime @default(now()) @db.Timestamp(0)\n  users      users    @relation(fields: [user_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id])\n}\n\nmodel daily_ops_logs {\n  id               Int      @id @default(autoincrement())\n  unit_id          Int\n  inspector_name   String   @db.VarChar(150)\n  service_date     DateTime @db.Date\n  created_at       DateTime @default(now()) @db.Timestamp(0)\n  fan_on           Boolean  @default(true)\n  fan_speed        Decimal? @db.Decimal(5, 2)\n  fan_curr_r       Decimal? @db.Decimal(5, 2)\n  fan_curr_s       Decimal? @db.Decimal(5, 2)\n  fan_curr_t       Decimal? @db.Decimal(5, 2)\n  fan_volt_r       Int?\n  fan_volt_s       Int?\n  fan_volt_t       Int?\n  heater_on        Boolean  @default(false)\n  heater_curr_r    Decimal? @db.Decimal(5, 2)\n  heater_curr_s    Decimal? @db.Decimal(5, 2)\n  heater_curr_t    Decimal? @db.Decimal(5, 2)\n  heater_volt_r    Int?\n  heater_volt_s    Int?\n  heater_volt_t    Int?\n  valve_opening    Decimal? @db.Decimal(5, 2)\n  supply_temp      Decimal? @db.Decimal(5, 2)\n  supply_rh        Decimal? @db.Decimal(5, 2)\n  return_temp      Decimal? @db.Decimal(5, 2)\n  return_rh        Decimal? @db.Decimal(5, 2)\n  fresh_temp       Decimal? @db.Decimal(5, 2)\n  fresh_rh         Decimal? @db.Decimal(5, 2)\n  filter_pre       String?  @db.VarChar(20)\n  filter_med       String?  @db.VarChar(20)\n  filter_hepa      String?  @db.VarChar(20)\n  room_temp        Decimal? @db.Decimal(5, 2)\n  room_diff_press  Decimal? @db.Decimal(5, 2)\n  temp_s1          Decimal? @db.Decimal(5, 2)\n  temp_s2          Decimal? @db.Decimal(5, 2)\n  temp_s3          Decimal? @db.Decimal(5, 2)\n  temp_s4          Decimal? @db.Decimal(5, 2)\n  temp_s5          Decimal? @db.Decimal(5, 2)\n  static_pressure  Decimal? @db.Decimal(10, 2)\n  vibration_status String?  @db.VarChar(50)\n  drainage_status  String?  @db.VarChar(50)\n  notes            String?  @db.Text\n  units            units    @relation(fields: [unit_id], references: [id], onDelete: Cascade)\n\n  @@index([unit_id], map: \"idx_daily_ops_unit\")\n  @@index([service_date], map: \"idx_daily_ops_date\")\n}\n\nenum projects_status {\n  active\n  archived\n}\n\nenum service_activities_type {\n  Audit\n  Preventive\n  Corrective\n}\n\nenum service_logs_service_type {\n  Cleaning\n  Repair\n  Maintenance\n  Part_Replacement @map(\"Part Replacement\")\n}\n\nenum tickets_priority {\n  Low\n  Medium\n  High\n  Critical\n}\n\nenum audit_tickets_physical_condition {\n  Good\n  Dirty\n  Damaged\n}\n\nenum audits_status {\n  Normal\n  Warning\n  Critical\n}\n\nenum customers_customer_type {\n  Corporate\n  Individual\n}\n\nenum sites_project_type {\n  Maintenance\n  Audit\n  Corrective\n}\n\nenum service_logs_status_after {\n  Normal\n  Warning\n  Critical\n}\n\nenum tickets_status {\n  Open\n  In_Progress @map(\"In Progress\")\n  Resolved\n  Closed\n}\n\nenum contracts_status {\n  Active\n  Expired\n  Pending\n}\n\nenum service_activities_status {\n  Pending\n  Engineer_Approved @map(\"Engineer Approved\")\n  Final_Approved    @map(\"Final Approved\")\n  Rejected\n}\n\nenum audit_tickets_finding_status {\n  Normal\n  Warning\n  Critical\n}\n\nenum units_status {\n  Normal\n  Warning\n  Critical\n  Problem\n  Pending\n  On_Progress\n}\n\nenum ahu_audits_approval_status {\n  Pending\n  Approved\n  Rejected\n}\n\nenum ScheduleType {\n  Preventive\n  Corrective\n  Audit\n  DailyLog\n}\n\nenum ScheduleStatus {\n  Planned\n  InProgress\n  Completed\n  Missed\n}\n\nmodel vendor_attendance {\n  id             Int       @id @default(autoincrement())\n  user_id        Int\n  project_id     BigInt    @db.UnsignedBigInt\n  check_in_time  DateTime  @default(now()) @db.Timestamp(0)\n  check_out_time DateTime? @db.Timestamp(0)\n\n  check_in_lat   Decimal? @db.Decimal(10, 8)\n  check_in_long  Decimal? @db.Decimal(11, 8)\n  check_out_lat  Decimal? @db.Decimal(10, 8)\n  check_out_long Decimal? @db.Decimal(11, 8)\n\n  check_in_photo  String? @db.VarChar(255)\n  check_out_photo String? @db.VarChar(255)\n\n  users    users    @relation(fields: [user_id], references: [id], onDelete: Cascade)\n  projects projects @relation(fields: [project_id], references: [id], onDelete: Cascade)\n\n  @@index([user_id, check_in_time])\n  @@index([project_id])\n}\n",
  "inlineSchemaHash": "22e6253f4a121566c8b0908981a83bc0bf6fd1f3f4d0cdaabdebb14f75165431",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"customers\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pic_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bidang_usaha\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pic_phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"customers_customer_type\",\"nativeType\":null,\"default\":\"Corporate\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contracts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"contracts\",\"nativeType\":null,\"relationName\":\"contractsTocustomers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"customersToprojects\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sites\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"sites\",\"nativeType\":null,\"relationName\":\"customersTosites\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"tickets\",\"nativeType\":null,\"relationName\":\"customersTotickets\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"permissions\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"80\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"role_permissions\",\"nativeType\":null,\"relationName\":\"permissionsTorole_permissions\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"projects\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"projects_status\",\"nativeType\":null,\"default\":\"active\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enabled_forms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"customers\",\"nativeType\":null,\"relationName\":\"customersToprojects\",\"relationFromFields\":[\"customer_id\"],\"relationToFields\":[\"id\"],\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_targets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_targets\",\"nativeType\":null,\"relationName\":\"projectsToschedule_targets\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"projectsToschedules\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"projectsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_project_access\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_project_access\",\"nativeType\":null,\"relationName\":\"projectsTouser_project_access\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendor_attendance\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"vendor_attendance\",\"nativeType\":null,\"relationName\":\"projectsTovendor_attendance\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"customer_id\",\"name\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"customer_id\",\"name\"]}],\"isGenerated\":false},\"refresh_tokens\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revoked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"refresh_tokensTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"user_id\",\"revoked_at\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"user_id\",\"revoked_at\"]}],\"isGenerated\":false},\"role_permissions\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"role_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"permission_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"permissions\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"permissions\",\"nativeType\":null,\"relationName\":\"permissionsTorole_permissions\",\"relationFromFields\":[\"permission_id\"],\"relationToFields\":[\"id\"],\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roles\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"roles\",\"nativeType\":null,\"relationName\":\"role_permissionsToroles\",\"relationFromFields\":[\"role_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"role_id\",\"permission_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"roles\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role_permissions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"role_permissions\",\"nativeType\":null,\"relationName\":\"role_permissionsToroles\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_roles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_roles\",\"nativeType\":null,\"relationName\":\"rolesTouser_roles\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"rolesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"units\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"site_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qr_code_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tag_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_group\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"area\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"building_floor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_tenant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brand\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"default\":\"Daikin\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capacity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yoi\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"serial_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"units_status\",\"nativeType\":null,\"default\":\"Normal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"last_service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_ref_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activities\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"activities\",\"nativeType\":null,\"relationName\":\"activitiesTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audit_tickets\",\"nativeType\":null,\"relationName\":\"audit_ticketsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audits\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audits\",\"nativeType\":null,\"relationName\":\"auditsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"complaints\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"complaints\",\"nativeType\":null,\"relationName\":\"complaintsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"corrective\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"corrective\",\"nativeType\":null,\"relationName\":\"correctiveTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"daily_ops_logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"daily_ops_logs\",\"nativeType\":null,\"relationName\":\"daily_ops_logsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"schedulesTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_activities\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_activities\",\"nativeType\":null,\"relationName\":\"service_activitiesTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_logs\",\"nativeType\":null,\"relationName\":\"service_logsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"tickets\",\"nativeType\":null,\"relationName\":\"ticketsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_comments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"unit_comments\",\"nativeType\":null,\"relationName\":\"unit_commentsTounits\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"projectsTounits\",\"relationFromFields\":[\"project_ref_id\"],\"relationToFields\":[\"id\"],\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_unit_access\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_unit_access\",\"nativeType\":null,\"relationName\":\"unitsTouser_unit_access\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user_project_access\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"projectsTouser_project_access\",\"relationFromFields\":[\"project_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"user_project_accessTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"project_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user_roles\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roles\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"roles\",\"nativeType\":null,\"relationName\":\"rolesTouser_roles\",\"relationFromFields\":[\"role_id\"],\"relationToFields\":[\"id\"],\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"user_rolesTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"role_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user_unit_access\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"unitsTouser_unit_access\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"user_unit_accessTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"user_id\",\"unit_id\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"users\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"company_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"two_factor_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"two_factor_secret\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"otp_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"6\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"otp_expiry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failed_login_attempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked_until\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attendance_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"face_reference_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"face_verification_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refresh_tokens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"refresh_tokens\",\"nativeType\":null,\"relationName\":\"refresh_tokensTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_messages\",\"nativeType\":null,\"relationName\":\"schedule_messagesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_targets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_targets\",\"nativeType\":null,\"relationName\":\"schedule_targetsTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"schedulesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_activities\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_activities\",\"nativeType\":null,\"relationName\":\"service_activitiesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_project_access\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_project_access\",\"nativeType\":null,\"relationName\":\"user_project_accessTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_push_tokens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_push_tokens\",\"nativeType\":null,\"relationName\":\"user_push_tokensTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_roles\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_roles\",\"nativeType\":null,\"relationName\":\"user_rolesTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_unit_access\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user_unit_access\",\"nativeType\":null,\"relationName\":\"user_unit_accessTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audit_logs\",\"nativeType\":null,\"relationName\":\"audit_logsTousers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roles\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"roles\",\"nativeType\":null,\"relationName\":\"rolesTousers\",\"relationFromFields\":[\"role_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vendor_attendance\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"vendor_attendance\",\"nativeType\":null,\"relationName\":\"usersTovendor_attendance\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"audit_logs\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"target_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"details\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ip_address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"45\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_agent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"audit_logsTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"password_reset_tokens\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"activities\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inspector_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer_note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technical_advice\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"voltage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"current_amp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pressure\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pdf_report_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technical_json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"default\":\"Completed\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"activitiesTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"activity_photos\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"default\":\"AUDIT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caption\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"media_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"default\":\"image\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_activities\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_activities\",\"nativeType\":null,\"relationName\":\"activity_photosToservice_activities\",\"relationFromFields\":[\"activity_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ahu_audits\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_tag\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prepared_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"design_airflow\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"design_cooling_capacity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chws_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chwr_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chws_press\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chwr_press\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"water_flow_gpm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_rs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_st\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_rt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_ln\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"visual_notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recommendation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pdf_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"approval_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ahu_audits_approval_status\",\"nativeType\":null,\"default\":\"Pending\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"approved_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"audit_tickets\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticket_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditor_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"physical_condition\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audit_tickets_physical_condition\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"suction_pressure\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discharge_pressure\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ampere\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"voltage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"finding_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audit_tickets_finding_status\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"audit_ticketsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"audit_velocity_points\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"point_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"velocity_value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_activities\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_activities\",\"nativeType\":null,\"relationName\":\"audit_velocity_pointsToservice_activities\",\"relationFromFields\":[\"audit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"audits\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_tenant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"default\":\"Audit\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"audits_status\",\"nativeType\":null,\"default\":\"Normal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"auditsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"contracts\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"site_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contract_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"start_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"end_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_frequency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"contracts_status\",\"nativeType\":null,\"default\":\"Active\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"customers\",\"nativeType\":null,\"relationName\":\"contractsTocustomers\",\"relationFromFields\":[\"customer_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"corrective\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technician_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"case_complain\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"root_cause\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"perm_action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recommendation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"default\":\"Final Approved\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"correctiveTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"corrective_maintenances\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tech_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issue_description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inspector_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"repair_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"finding\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"advise\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"report_pdf\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"maintenance_contracts\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technician_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"service_activities\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_activities_type\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sales_engineer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pdf_report_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"service_activities_status\",\"nativeType\":null,\"default\":\"Pending\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer_note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sales_note\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inspector_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technical_json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technical_advice\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_tag\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"design_airflow\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"design_cooling_capacity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entering_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaving_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_db\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_wb\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chws_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chwr_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chws_press\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"chwr_press\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"water_flow_gpm\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":[\"Float\",[]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amp_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_rs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_st\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_rt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"volt_ln\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"berita_acara_pdf_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_approved_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_approver_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer_signer_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_approved_by_customer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activity_photos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"activity_photos\",\"nativeType\":null,\"relationName\":\"activity_photosToservice_activities\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audit_velocity_points\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"audit_velocity_points\",\"nativeType\":null,\"relationName\":\"audit_velocity_pointsToservice_activities\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"service_activitiesTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"service_activitiesTousers\",\"relationFromFields\":[\"engineer_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"service_logs\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_logs_service_type\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"technician_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status_after\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"service_logs_status_after\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"service_logsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"service_photos\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"log_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"sites\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"site_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gps_location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"sites_project_type\",\"nativeType\":null,\"default\":\"Maintenance\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress_value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"customers\",\"nativeType\":null,\"relationName\":\"customersTosites\",\"relationFromFields\":[\"customer_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"tickets\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subject\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"tickets_priority\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"tickets_status\",\"nativeType\":null,\"default\":\"Open\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"ticketsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customers\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"customers\",\"nativeType\":null,\"relationName\":\"customersTotickets\",\"relationFromFields\":[\"customer_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"unit_comments\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"default\":\"Customer\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"unit_commentsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"relationOnUpdate\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"schedules\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"start_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"end_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ScheduleType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ScheduleStatus\",\"nativeType\":null,\"default\":\"Planned\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"google_event_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignee_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_attendance\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_attendance\",\"nativeType\":null,\"relationName\":\"schedule_attendanceToschedules\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_messages\",\"nativeType\":null,\"relationName\":\"schedule_messagesToschedules\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_mom\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedule_mom\",\"nativeType\":null,\"relationName\":\"schedule_momToschedules\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"schedulesTousers\",\"relationFromFields\":[\"assignee_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"projectsToschedules\",\"relationFromFields\":[\"project_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"schedulesTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"schedule_attendance\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_present\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signature\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"schedule_attendanceToschedules\",\"relationFromFields\":[\"schedule_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"schedule_mom\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"schedule_momToschedules\",\"relationFromFields\":[\"schedule_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"schedule_messages\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedule_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attachments\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"is_system\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"system_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schedules\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"schedules\",\"nativeType\":null,\"relationName\":\"schedule_messagesToschedules\",\"relationFromFields\":[\"schedule_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"schedule_messagesTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"schedule_targets\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignee_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ScheduleType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"daily_target\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monthly_target\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"month\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"year\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearly_target\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"schedule_targetsTousers\",\"relationFromFields\":[\"assignee_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"projectsToschedule_targets\",\"relationFromFields\":[\"project_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"complaints\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customer_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":\"Pending\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"complaintsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user_push_tokens\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"512\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"platform\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"default\":\"web\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"user_push_tokensTousers\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"daily_ops_logs\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inspector_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"150\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"service_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Date\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_on\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_speed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_curr_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_curr_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_curr_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_volt_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_volt_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fan_volt_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_on\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_curr_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_curr_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_curr_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_volt_r\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_volt_s\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heater_volt_t\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valve_opening\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"supply_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"supply_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"return_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"return_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fresh_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fresh_rh\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filter_pre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filter_med\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filter_hepa\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_temp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"room_diff_press\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_s1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_s2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_s3\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_s4\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"temp_s5\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"5\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"static_pressure\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"2\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"vibration_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"drainage_status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"units\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"units\",\"nativeType\":null,\"relationName\":\"daily_ops_logsTounits\",\"relationFromFields\":[\"unit_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"vendor_attendance\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"nativeType\":[\"UnsignedBigInt\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_in_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_out_time\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"Timestamp\",[\"0\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_in_lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"8\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_in_long\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"11\",\"8\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_out_lat\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"10\",\"8\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_out_long\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"nativeType\":[\"Decimal\",[\"11\",\"8\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_in_photo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"check_out_photo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"255\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users\",\"nativeType\":null,\"relationName\":\"usersTovendor_attendance\",\"relationFromFields\":[\"user_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"projects\",\"nativeType\":null,\"relationName\":\"projectsTovendor_attendance\",\"relationFromFields\":[\"project_id\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"projects_status\":{\"values\":[{\"name\":\"active\",\"dbName\":null},{\"name\":\"archived\",\"dbName\":null}],\"dbName\":null},\"service_activities_type\":{\"values\":[{\"name\":\"Audit\",\"dbName\":null},{\"name\":\"Preventive\",\"dbName\":null},{\"name\":\"Corrective\",\"dbName\":null}],\"dbName\":null},\"service_logs_service_type\":{\"values\":[{\"name\":\"Cleaning\",\"dbName\":null},{\"name\":\"Repair\",\"dbName\":null},{\"name\":\"Maintenance\",\"dbName\":null},{\"name\":\"Part_Replacement\",\"dbName\":\"Part Replacement\"}],\"dbName\":null},\"tickets_priority\":{\"values\":[{\"name\":\"Low\",\"dbName\":null},{\"name\":\"Medium\",\"dbName\":null},{\"name\":\"High\",\"dbName\":null},{\"name\":\"Critical\",\"dbName\":null}],\"dbName\":null},\"audit_tickets_physical_condition\":{\"values\":[{\"name\":\"Good\",\"dbName\":null},{\"name\":\"Dirty\",\"dbName\":null},{\"name\":\"Damaged\",\"dbName\":null}],\"dbName\":null},\"audits_status\":{\"values\":[{\"name\":\"Normal\",\"dbName\":null},{\"name\":\"Warning\",\"dbName\":null},{\"name\":\"Critical\",\"dbName\":null}],\"dbName\":null},\"customers_customer_type\":{\"values\":[{\"name\":\"Corporate\",\"dbName\":null},{\"name\":\"Individual\",\"dbName\":null}],\"dbName\":null},\"sites_project_type\":{\"values\":[{\"name\":\"Maintenance\",\"dbName\":null},{\"name\":\"Audit\",\"dbName\":null},{\"name\":\"Corrective\",\"dbName\":null}],\"dbName\":null},\"service_logs_status_after\":{\"values\":[{\"name\":\"Normal\",\"dbName\":null},{\"name\":\"Warning\",\"dbName\":null},{\"name\":\"Critical\",\"dbName\":null}],\"dbName\":null},\"tickets_status\":{\"values\":[{\"name\":\"Open\",\"dbName\":null},{\"name\":\"In_Progress\",\"dbName\":\"In Progress\"},{\"name\":\"Resolved\",\"dbName\":null},{\"name\":\"Closed\",\"dbName\":null}],\"dbName\":null},\"contracts_status\":{\"values\":[{\"name\":\"Active\",\"dbName\":null},{\"name\":\"Expired\",\"dbName\":null},{\"name\":\"Pending\",\"dbName\":null}],\"dbName\":null},\"service_activities_status\":{\"values\":[{\"name\":\"Pending\",\"dbName\":null},{\"name\":\"Engineer_Approved\",\"dbName\":\"Engineer Approved\"},{\"name\":\"Final_Approved\",\"dbName\":\"Final Approved\"},{\"name\":\"Rejected\",\"dbName\":null}],\"dbName\":null},\"audit_tickets_finding_status\":{\"values\":[{\"name\":\"Normal\",\"dbName\":null},{\"name\":\"Warning\",\"dbName\":null},{\"name\":\"Critical\",\"dbName\":null}],\"dbName\":null},\"units_status\":{\"values\":[{\"name\":\"Normal\",\"dbName\":null},{\"name\":\"Warning\",\"dbName\":null},{\"name\":\"Critical\",\"dbName\":null},{\"name\":\"Problem\",\"dbName\":null},{\"name\":\"Pending\",\"dbName\":null},{\"name\":\"On_Progress\",\"dbName\":null}],\"dbName\":null},\"ahu_audits_approval_status\":{\"values\":[{\"name\":\"Pending\",\"dbName\":null},{\"name\":\"Approved\",\"dbName\":null},{\"name\":\"Rejected\",\"dbName\":null}],\"dbName\":null},\"ScheduleType\":{\"values\":[{\"name\":\"Preventive\",\"dbName\":null},{\"name\":\"Corrective\",\"dbName\":null},{\"name\":\"Audit\",\"dbName\":null},{\"name\":\"DailyLog\",\"dbName\":null}],\"dbName\":null},\"ScheduleStatus\":{\"values\":[{\"name\":\"Planned\",\"dbName\":null},{\"name\":\"InProgress\",\"dbName\":null},{\"name\":\"Completed\",\"dbName\":null},{\"name\":\"Missed\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined
config.compilerWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

