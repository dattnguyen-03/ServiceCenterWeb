import React, { useState } from 'react';
import { Tabs } from 'antd';
import { DatabaseOutlined, ToolOutlined } from '@ant-design/icons';
import InventoryManagement from './InventoryManagement';
import PartUsageManagement from './PartUsageManagement';

const InventoryPartUsageCombined: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('inventory');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Kho & Sử Dụng Phụ Tùng</h2>
        <p className="text-gray-600 mt-1">Quản lý tồn kho và việc sử dụng phụ tùng trong các trung tâm dịch vụ</p>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'inventory',
            label: (
              <span>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                Tồn Kho
              </span>
            ),
            children: <InventoryManagement />,
          },
          {
            key: 'usage',
            label: (
              <span>
                <ToolOutlined style={{ marginRight: 8 }} />
                Sử Dụng Phụ Tùng
              </span>
            ),
            children: <PartUsageManagement />,
          },
        ]}
      />
    </div>
  );
};

export default InventoryPartUsageCombined;

