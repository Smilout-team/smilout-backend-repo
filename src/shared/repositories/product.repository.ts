import { prisma } from '@/utils/prisma.js';

const productRepository = {
  findById: async (id: string) => {
    // Chỉ lấy sản phẩm chưa bị xóa mềm (deletedAt: null)
    return await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
  },
};

export default productRepository;
