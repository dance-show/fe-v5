import React, { useRef } from 'react';
import _ from 'lodash';
import { useInViewport } from 'ahooks';
import { Dropdown, Menu, Tooltip } from 'antd';
import { InfoOutlined, DownOutlined, LinkOutlined, SettingOutlined, ShareAltOutlined, DeleteOutlined, CopyOutlined, SyncOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';
import { VariableType } from '../../VariableConfig';
import Markdown from '../../Editor/Components/Markdown';
import usePrometheus from '../datasource/usePrometheus';
import { IPanel } from '../../types';
import './style.less';

interface IProps {
  dashboardId: string;
  id?: string;
  time: Range;
  refreshFlag: string;
  step: number | null;
  type: string;
  values: IPanel;
  variableConfig?: VariableType;
  isPreview?: boolean; // 是否是预览，预览中不显示编辑和分享
  onCloneClick?: () => void;
  onShareClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

function index(props: IProps) {
  const { dashboardId, id, time, refreshFlag, step, type, variableConfig, values, isPreview, onCloneClick, onShareClick, onEditClick, onDeleteClick } = props;
  const ref = useRef<HTMLDivElement>(null);
  const inViewPort = useInViewport(ref);
  const { series, loading } = usePrometheus({
    id,
    dashboardId,
    time,
    refreshFlag,
    step,
    targets: values.targets,
    variableConfig,
    inViewPort: isPreview || inViewPort,
  });
  const subProps = {
    values,
    series,
  };
  const tipsVisible = values.description || !_.isEmpty(values.links);
  if (_.isEmpty(values)) return null;
  const RendererCptMap = {
    timeseries: () => <Timeseries {...subProps} />,
    stat: () => <Stat {...subProps} />,
    table: () => <Table {...subProps} />,
    pie: () => <Pie {...subProps} />,
  };

  return (
    <div className='renderer-container' ref={ref}>
      <div className='renderer-header graph-header'>
        {tipsVisible ? (
          <Tooltip
            placement='rightTop'
            overlayInnerStyle={{
              width: 300,
            }}
            title={
              <div>
                <Markdown content={values.description} />
                <div>
                  {_.map(values.links, (link) => {
                    return (
                      <div style={{ marginTop: 8 }}>
                        <a href={link.url} target={link.targetBlank ? '_blank' : '_self'}>
                          {link.title}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            }
          >
            <div className='renderer-header-desc'>
              <span className='renderer-header-info-corner-inner' />
              {values.description ? <InfoOutlined /> : <LinkOutlined />}
            </div>
          </Tooltip>
        ) : null}
        <div className='renderer-header-content'>
          {!isPreview ? (
            <Dropdown
              trigger={['click']}
              placement='bottomCenter'
              overlayStyle={{
                minWidth: '100px',
              }}
              overlay={
                <Menu>
                  {!isPreview ? (
                    <>
                      <Menu.Item onClick={onEditClick}>
                        <SettingOutlined />
                        编辑
                      </Menu.Item>
                      <Menu.Item onClick={onCloneClick}>
                        <CopyOutlined />
                        克隆
                      </Menu.Item>
                      <Menu.Item onClick={onShareClick}>
                        <ShareAltOutlined />
                        分享
                      </Menu.Item>
                      <Menu.Item onClick={onDeleteClick}>
                        <DeleteOutlined />
                        删除
                      </Menu.Item>
                    </>
                  ) : null}
                </Menu>
              }
            >
              <div className='renderer-header-title'>
                {values.name}
                <DownOutlined className='renderer-header-arrow' />
              </div>
            </Dropdown>
          ) : (
            <div className='renderer-header-title'>{values.name}</div>
          )}
        </div>
        <div className='renderer-header-loading'>{loading && <SyncOutlined spin />}</div>
      </div>
      <div className='renderer-body' style={{ height: `calc(100% - 36px)` }}>
        {RendererCptMap[type] ? RendererCptMap[type]() : `无效的图表类型 ${type}`}
      </div>
    </div>
  );
}

export default React.memo(index);
