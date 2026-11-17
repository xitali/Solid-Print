import * as migration_20261031_215421_initial from './20261031_215421_initial';
import * as migration_20261031_220723_upload_integrity_and_related_projects from './20261031_220723_upload_integrity_and_related_projects';
import * as inquiry_history from './20261101_203900_inquiry_history';
import * as catalog_options from './20261117_201400_catalog_options';
import * as project_card_image from './20261117_215000_project_card_image';

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
  {up:catalog_options.up,down:catalog_options.down,name:'20261117_201400_catalog_options'},
  {up:project_card_image.up,down:project_card_image.down,name:'20261117_215000_project_card_image'},
];
