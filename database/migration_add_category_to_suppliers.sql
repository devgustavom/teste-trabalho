-- Migração: Adicionar campo category na tabela suppliers
-- Execute este script se a tabela suppliers já existir

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100);

