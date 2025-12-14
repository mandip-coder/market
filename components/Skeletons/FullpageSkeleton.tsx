'use client'
// fullpageskeleton.tsx
import { Card, Col, Row, Skeleton } from 'antd';
import { ProductSkeleton } from './ProductCardSkelton';

const FullPageSkeleton = () => {

  return (
    <div className=''>
      {/* Filters Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
        <Col sm={4}>
          <Skeleton active paragraph={false} />
        </Col>
      </Row>

      {/* healthcare Count and Pagination */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Skeleton active paragraph={false} style={{ width: 200 }} />
        </Col>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Skeleton.Button active size="small" />
            <Skeleton active paragraph={false} style={{ width: 120 }} />
            <Skeleton.Button active size="small" />
          </div>
        </Col>
      </Row>

      {/* healthcares Grid View */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {Array(6).fill(null).map((_, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <ProductSkeleton/>
          </Col>
        ))}
      </Row>

    </div>
  );
};

export default FullPageSkeleton;