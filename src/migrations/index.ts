import * as migration_20261031_215421_initial from './20261031_215421_initial';
import * as migration_20261031_220723_upload_integrity_and_related_projects from './20261031_220723_upload_integrity_and_related_projects';
import * as inquiry_history from './20261101_203900_inquiry_history';

export const migrations = [
  {
    up: migration_20261031_215421_initial.up,
    down: migration_20261031_215421_initial.down,
    name: '20261031_215421_initial',
  },
  {
    up: migration_20261031_220723_upload_integrity_and_related_projects.up,
    down: migration_20261031_220723_upload_integrity_and_related_projects.down,
    name: '20261031_220723_upload_integrity_and_related_projects'
  },
  {up:inquiry_history.up,down:inquiry_history.down,name:'20261101_203900_inquiry_history'},
];
