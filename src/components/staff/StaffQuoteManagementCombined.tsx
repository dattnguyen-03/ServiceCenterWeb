import React, { useState } from 'react';
import { Tabs } from 'antd';
import { FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import StaffQuoteManagement from './StaffQuoteManagement';
import StaffQuoteRequestManagement from './StaffQuoteRequestManagement';

const StaffQuoteManagementCombined: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('requests');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Báo Giá</h2>
        <p className="text-gray-600 mt-1">Quản lý yêu cầu báo giá và báo giá của trung tâm</p>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'requests',
            label: (
              <span>
                <ShoppingCartOutlined style={{ marginRight: 8 }} />
                Yêu Cầu Báo Giá
              </span>
            ),
            children: <StaffQuoteRequestManagement />,
          },
          {
            key: 'quotes',
            label: (
              <span>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Quản Lý Báo Giá
              </span>
            ),
            children: <StaffQuoteManagement />,
          },
        ]}
      />
    </div>
  );
};

export default StaffQuoteManagementCombined;

