import React, { useState } from 'react';
import { Tabs } from 'antd';
import { FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import QuoteManagement from './QuoteManagement';
import QuoteRequestManagement from './QuoteRequestManagement';

const QuoteManagementCombined: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('requests');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Báo Giá</h2>
        <p className="text-gray-600 mt-1">Quản lý yêu cầu báo giá và báo giá của hệ thống</p>
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
            children: <QuoteRequestManagement />,
          },
          {
            key: 'quotes',
            label: (
              <span>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Quản Lý Báo Giá
              </span>
            ),
            children: <QuoteManagement />,
          },
        ]}
      />
    </div>
  );
};

export default QuoteManagementCombined;

