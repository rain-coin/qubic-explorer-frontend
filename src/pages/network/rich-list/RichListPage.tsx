import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, PaginationBar } from '@app/components/ui'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetRickListQuery } from '@app/store/apis/archiver-v1.api'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { HomeLink } from '../components'
import { RichListErrorRow, RichListRow, RichListSkeletonRow } from './components'

const PAGE_SIZE = 15

const RichListLoadingRows = memo(() => {
  return Array.from({ length: PAGE_SIZE }).map((_, index) => (
    <RichListSkeletonRow key={String(`${index}`)} />
  ))
})

function RichListPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)

  const { data, isFetching, error } = useGetRickListQuery({
    page,
    pageSize: PAGE_SIZE
  })

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams({ page: value.toString() })
    },
    [setSearchParams]
  )

  const entitiesWithRank = useMemo(
    () =>
      data?.richList.entities?.map((entity, index) => ({
        ...entity,
        rank: (data.pagination.currentPage - 1) * PAGE_SIZE + index + 1
      })),
    [data]
  )

  useEffect(() => {
    if (!searchParams.has('page')) {
      setSearchParams({ page: '1' })
    }
  }, [searchParams, setSearchParams])

  const renderTableContent = useCallback(() => {
    if (isFetching) return <RichListLoadingRows />

    if (error || entitiesWithRank?.length === 0) {
      return <RichListErrorRow />
    }

    return entitiesWithRank?.map((entity) => (
      <RichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isFetching, error, isMobile])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[960px] space-y-20 px-20 py-32 md:space-y-40">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <p className="text-xs text-primary-30">{t('richList')}</p>
        </Breadcrumbs>
        <div className="space-y-14 md:space-y-28">
          <div className="space-y-10">
            <p className="font-space text-24 font-500 leading-26">{t('richList')}</p>
            <p className="text-left text-sm text-gray-50">{t('richListWarning')}</p>
          </div>
          <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
            <div className="overflow-x-scroll">
              <table className="w-full">
                <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                  <tr>
                    <th className="p-16 text-center font-400 sm:w-72">
                      <span className="hidden text-gray-50 sm:block">{t('rank')}</span>
                    </th>
                    <th className="p-16 font-400">
                      <span className="text-gray-50">{t('addressID')}</span>
                    </th>
                    <th className="p-16 text-right font-400">
                      <span className="text-gray-50">{t('amount')} (QUBIC)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>{renderTableContent()}</tbody>
              </table>
            </div>
            <PaginationBar
              className="mx-auto w-fit gap-8 p-20"
              pageCount={data?.pagination.totalPages ?? 0}
              page={page}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const RichListPageWithHelmet = withHelmet(RichListPage, {
  title: 'Rich List | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the addresses rich list of Qubic Network' }]
})

export default RichListPageWithHelmet
