
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
  locked_until: 'locked_until'
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
  otp_code: 'otp_code'
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
exports.customers_customer_type = exports.$Enums.customers_customer_type = {
  Corporate: 'Corporate',
  Individual: 'Individual'
};

exports.projects_status = exports.$Enums.projects_status = {
  active: 'active',
  archived: 'archived'
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

exports.audit_tickets_physical_condition = exports.$Enums.audit_tickets_physical_condition = {
  Good: 'Good',
  Dirty: 'Dirty',
  Damaged: 'Damaged'
};

exports.audit_tickets_finding_status = exports.$Enums.audit_tickets_finding_status = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.audits_status = exports.$Enums.audits_status = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.contracts_status = exports.$Enums.contracts_status = {
  Active: 'Active',
  Expired: 'Expired',
  Pending: 'Pending'
};

exports.service_activities_type = exports.$Enums.service_activities_type = {
  Audit: 'Audit',
  Preventive: 'Preventive',
  Corrective: 'Corrective'
};

exports.service_activities_status = exports.$Enums.service_activities_status = {
  Pending: 'Pending',
  Engineer_Approved: 'Engineer_Approved',
  Final_Approved: 'Final_Approved',
  Rejected: 'Rejected'
};

exports.service_logs_service_type = exports.$Enums.service_logs_service_type = {
  Cleaning: 'Cleaning',
  Repair: 'Repair',
  Maintenance: 'Maintenance',
  Part_Replacement: 'Part_Replacement'
};

exports.service_logs_status_after = exports.$Enums.service_logs_status_after = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical'
};

exports.sites_project_type = exports.$Enums.sites_project_type = {
  Maintenance: 'Maintenance',
  Audit: 'Audit',
  Corrective: 'Corrective'
};

exports.tickets_priority = exports.$Enums.tickets_priority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical'
};

exports.tickets_status = exports.$Enums.tickets_status = {
  Open: 'Open',
  In_Progress: 'In_Progress',
  Resolved: 'Resolved',
  Closed: 'Closed'
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
  daily_ops_logs: 'daily_ops_logs'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
